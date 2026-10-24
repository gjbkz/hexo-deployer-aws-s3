import * as fs from 'fs';
import {S3 as AWSS3} from '@aws-sdk/client-s3';
import type {ObjectCannedACL} from '@aws-sdk/client-s3';
import * as fg from 'fast-glob';
import * as mime from 'mime';
import * as path from 'upath';
import {S3Mock} from './S3Mock';

const objectACLs = new Set([
    'none', 'private', 'public-read', 'public-read-write', 'authenticated-read',
    'aws-exec-read', 'bucket-owner-read', 'bucket-owner-full-control',
]);

interface HexoContext {
    readonly log: {info: (...args: Array<unknown>) => void},
    readonly public_dir: string,
}

interface HexoDeployment {
    readonly region: string,
    readonly prefix: string,
    readonly bucket: string,
    readonly glob: fg.Options,
    readonly test: string,
    readonly acl?: string,
    readonly concurrency?: number,
}

interface HexoDeployer {
    (this: HexoContext, deploy: HexoDeployment): Promise<void>,
}

interface HexoDeployerExtender {
    readonly register: (name: string, deployer: HexoDeployer) => Promise<void>,
}

interface HexoExtender {
    readonly deployer: HexoDeployerExtender,
}

declare global {
    const hexo: {
        readonly extend: HexoExtender,
    };
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
hexo.extend.deployer.register(
    'aws-s3',
    async function deployer(this: HexoContext, deploy: HexoDeployment) {
        const {acl = 'public-read', concurrency = 8} = deploy;
        if (typeof deploy.bucket !== 'string' || !deploy.bucket.trim()) {
            throw new Error('aws-s3: bucket must be a non-empty string');
        }
        if (typeof deploy.region !== 'string' || !deploy.region.trim()) {
            throw new Error('aws-s3: region must be a non-empty string');
        }
        if (!objectACLs.has(acl)) {
            throw new Error('aws-s3: acl must be none or a supported S3 object ACL');
        }
        if (!Number.isSafeInteger(concurrency) || concurrency < 1) {
            throw new Error('aws-s3: concurrency must be a positive safe integer');
        }
        const {log, public_dir: publicDir} = this;
        const globPattern = path.join(publicDir, '**/*');
        const files = await fg(globPattern, {...deploy.glob, onlyFiles: true});
        const clientConfig = {region: deploy.region};
        const s3 = deploy.test ? new S3Mock(deploy.test, clientConfig) : new AWSS3(clientConfig);
        log.info(`Found ${files.length} files`);
        let nextFile = 0;
        let uploaded = 0;
        let failed = false;
        let failure: unknown;
        const upload = async (filepath: string): Promise<void> => {
            const Key = path.toUnix(path.join(deploy.prefix || '', path.relative(publicDir, filepath)));
            // eslint-disable-next-line import/namespace
            const ContentType = mime.getType(filepath) || undefined;
            const Body = fs.createReadStream(filepath);
            try {
                await s3.putObject({
                    Bucket: deploy.bucket,
                    Key,
                    Body,
                    ContentType,
                    ...(acl === 'none' ? {} : {ACL: acl as ObjectCannedACL}),
                });
            } catch (error) {
                log.info(`Failed to upload ${Key}`);
                throw error;
            } finally {
                Body.destroy();
            }
            log.info(`Uploaded ${Key} [${ContentType}]`);
            uploaded += 1;
        };
        const worker = async (): Promise<void> => {
            while (!failed && nextFile < files.length) {
                const filepath = files[nextFile++];
                try {
                    await upload(filepath);
                } catch (error) {
                    if (!failed) {
                        failed = true;
                        failure = error;
                    }
                }
            }
        };
        await Promise.all(Array.from({length: Math.min(concurrency, files.length)}, worker));
        if (failed) {
            throw failure;
        }
        log.info(`Uploaded ${uploaded} files`);
    },
);
