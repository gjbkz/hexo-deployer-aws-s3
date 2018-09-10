const fs = require('fs');
const Promise = require('bluebird');
const {S3} = require('./s3');
const mime = require('mime');
const upath = require('upath');
const glob = Promise.promisify(require('glob'));
const readFile = Promise.promisify(fs.readFile);

exports.deployer = function (deploy) {
    const {
        log,
        public_dir: publicDir,
    } = this;
    const globPattern = upath.join(publicDir, '**/*');
    log.info(`Glob ${globPattern}`);
    return glob(globPattern, Object.assign({}, deploy.glob, {nodir: true}))
    .then((files) => {
        const s3 = new S3({region: deploy.region});
        let uploadCount = 0;
        log.info(`Found ${files.length} files`);
        if (deploy.isTest) {
            deploy.isTest(s3);
        }
        return Promise.all(files.map((filepath) => {
            const Key = upath.toUnix(upath.join(deploy.prefix || '', upath.relative(publicDir, filepath)));
            const ContentType = mime.getType(filepath);
            return readFile(filepath, 'utf8')
            .then((Body) => s3.putObject({
                Bucket: deploy.bucket,
                Key,
                Body,
                ContentType,
                ACL: 'public-read',
            }).promise())
            .then(() => {
                log.info(`Uploaded ${Key} [${ContentType}]`);
                uploadCount += 1;
            })
            .catch((error) => {
                log.error(error);
                log.error(`Upload Failed: ${Key} [${ContentType}]`);
            });
        }))
        .then(() => uploadCount);
    })
    .then((uploadCount) => {
        log.info(`Uploaded ${uploadCount} files`);
    });
};
