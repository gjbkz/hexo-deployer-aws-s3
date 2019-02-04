import {createReadStream} from 'fs';
import {getType} from 'mime';
import {join, relative, toUnix} from 'upath';
import {S3 as AWSS3} from 'aws-sdk';
import {S3Mock} from './S3Mock';
import glob = require('glob');

export interface IHexoContext {
    log: {
        info: (...args: Array<string | number | {}>) => void,
    },
    public_dir: string,
}

export interface IHexoDeployment {
    region: string,
    prefix: string,
    bucket: string,
    glob: glob.IOptions,
    test: string,
}

declare global {
    const hexo: {
        extend: {
            deployer: {
                register: (
                    name: string,
                    deployer: (
                        this: IHexoContext,
                        deploy: IHexoDeployment,
                    ) => Promise<void>,
                ) => Promise<void>,
            },
        },
    };
}

hexo.extend.deployer.register(
    'aws-s3',
    async function deployer(this: IHexoContext, deploy: IHexoDeployment): Promise<void> {
        const {log, public_dir: publicDir} = this;
        const globPattern = join(publicDir, '**/*');
        const files = await new Promise<Array<string>>((resolve, reject) => {
            glob(globPattern, {...deploy.glob, nodir: true}, (error, files) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(files);
                }
            });
        });
        const clientConfig = {region: deploy.region};
        const s3 = deploy.test ? new S3Mock(deploy.test, clientConfig) : new AWSS3(clientConfig);
        log.info(`Found ${files.length} files`);
        const results = await Promise.all(files.map(async (filepath) => {
            const Key = toUnix(join(deploy.prefix || '', relative(publicDir, filepath)));
            const ContentType = getType(filepath) || undefined;
            const params: AWSS3.Types.PutObjectRequest = {
                Bucket: deploy.bucket,
                Key,
                Body: createReadStream(filepath),
                ContentType,
                ACL: 'public-read',
            };
            await s3.putObject(params).promise();
            log.info(`Uploaded ${Key} [${ContentType}]`);
        }));
        log.info(`Uploaded ${results.length} files`);
    },
);
