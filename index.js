var fs = require('fs');
var AWS = require('aws-sdk');
var mime = require('mime');
var upath = require('upath');
var glob = require('glob');

var ACL_PUBLIC_READ = 'public-read';

var callbackPromise = function (fn) {
	return new Promise(function (resolve, reject) {
		fn(function (error, result) {
			if (error) {
				reject(error);
			} else {
				resolve(result);
			}
		});
	});
};

hexo.extend.deployer.register('aws-s3', function () {
	var config = this.config;
	var baseDir = this.base_dir;
	var publicDir = upath.join(baseDir, config.public_dir);
	var s3 = new AWS.S3({
		region: config.deploy.region
	});
	callbackPromise(function (callback) {
		var globOptions = config.deploy.glob || {};
		globOptions.nodir = true;
		glob(upath.join(publicDir, '**', '*'), globOptions, callback);
	}).then(function (files) {
		return Promise.all(files.map(function (filepath) {
			return callbackPromise(function (callback) {
				fs.readFile(filepath, callback);
			}).then(function (buffer) {
				var params = {
					Bucket: config.deploy.bucket,
					Key: upath.toUnix(upath.join(config.deploy.prefix || '', upath.relative(publicDir, filepath))),
					Body: buffer,
					ContentType: mime.lookup(filepath),
					ACL: ACL_PUBLIC_READ
				};
				return callbackPromise(function (callback) {
					s3.putObject(params, callback);
				}).then(function () {
					console.log(`Uploaded: ${params.Key} [${params.ContentType}]`);
				}).catch(function (error) {
					console.error(error);
					console.log(`Upload Failed: ${params.Key} [${params.ContentType}]`);
				});
			});
		}));
	});
});
