const fs = require('fs');
const {S3Client, PutObjectCommand} = require('./s3');
const mime = require('mime');
const upath = require('upath');
const {glob} = require('glob');

exports.deployer = async function (deploy) {
    const {
        log,
        public_dir: publicDir,
    } = this;
    const globPattern = upath.join(publicDir, '**/*');
    log.info(`Glob ${globPattern}`);
    const files = await glob(globPattern, Object.assign({}, deploy.glob, {nodir: true}));
    const s3 = new S3Client({region: deploy.region});
    let uploadCount = 0;
    log.info(`Found ${files.length} files`);
    if (deploy.isTest) {
        deploy.isTest(s3);
    }
    await Promise.all(files.map(async (filepath) => {
        const Key = upath.toUnix(upath.join(deploy.prefix || '', upath.relative(publicDir, filepath)));
        const ContentType = mime.getType(filepath);
        try {
            const Body = await fs.promises.readFile(filepath);
            await s3.send(new PutObjectCommand({
                Bucket: deploy.bucket,
                Key,
                Body,
                ContentType,
                ACL: 'public-read',
            }));
            log.info(`Uploaded ${Key} [${ContentType}]`);
            uploadCount += 1;
        } catch (error) {
            log.error(error);
            log.error(`Upload Failed: ${Key} [${ContentType}]`);
        }
    }));
    log.info(`Uploaded ${uploadCount} files`);
};
