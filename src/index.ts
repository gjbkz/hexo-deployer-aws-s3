import * as fs from 'fs';
import {S3 as AWSS3} from '@aws-sdk/client-s3';
import * as fg from 'fast-glob';
import * as mime from 'mime';
import * as path from 'upath';
import {S3Mock} from './S3Mock';

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
        const {log, public_dir: publicDir} = this;
        const globPattern = path.join(publicDir, '**/*');
        const files = await fg(globPattern, {...deploy.glob, onlyFiles: true});
        const clientConfig = {region: deploy.region};
        const s3 = deploy.test ? new S3Mock(deploy.test, clientConfig) : new AWSS3(clientConfig);
        log.info(`Found ${files.length} files`);
        const results = await Promise.all(files.map(async (filepath) => {
            const Key = path.toUnix(path.join(deploy.prefix || '', path.relative(publicDir, filepath)));
            // eslint-disable-next-line import/namespace
            const ContentType = mime.getType(filepath) || undefined;
            await s3.putObject({
                Bucket: deploy.bucket,
                Key,
                Body: fs.createReadStream(filepath),
                ContentType,
                ACL: 'public-read',
            });
            log.info(`Uploaded ${Key} [${ContentType}]`);
        }));
        log.info(`Uploaded ${results.length} files`);
    },
);
