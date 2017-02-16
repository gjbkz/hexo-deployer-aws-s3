var fs = require('fs');
var Promise = require('bluebird');
var S3 = require('./s3');
var mime = require('mime');
var upath = require('upath');
var glob = Promise.promisify(require('glob'));
var readFile = Promise.promisify(fs.readFile, {context: fs});

module.exports = function (deploy) {
	var log = this.log;
	var publicDir = this.public_dir;
	var globOptions = deploy.glob || {};
	var globPattern = upath.join(publicDir, '**', '*');
	globOptions.nodir = true;
	log.info('Glob ' + globPattern);
	return glob(globPattern, globOptions)
		.then(function (files) {
			var s3 = new S3({
				region: deploy.region
			});
			var putObject = Promise.promisify(s3.putObject, {context: s3});
			var uploadCount = 0;
			log.info('Found ' + files.length + ' files');
			if (deploy.isTest) {
				deploy.isTest(s3);
			}
			return Promise.all(files.map(function (filepath) {
				var params = {
					Bucket: deploy.bucket,
					Key: upath.toUnix(upath.join(deploy.prefix || '', upath.relative(publicDir, filepath))),
					ContentType: mime.lookup(filepath),
					ACL: 'public-read'
				};
				return readFile(filepath)
					.then(function (buffer) {
						params.Body = buffer;
						return putObject(params);
					}).then(function () {
						log.info('Uploaded: ' + params.Key + ' [' + params.ContentType + ']');
						uploadCount += 1;
					}).catch(function (error) {
						log.error(error);
						log.error('Upload Failed: ' + params.Key + ' [' + params.ContentType + ']');
					});
			})).then(function () {
				return uploadCount;
			});
		})
		.then(function (uploadCount) {
			log.info('Uploaded ' + uploadCount + ' files');
		})
		.catch(function (error) {
			log.error(error);
		});
};
