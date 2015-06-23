/* globals module, require, console */
(function (module, require, console) {

	'use strict';

	var ACL_PUBLIC_READ = 'public-read';

	var fs = require('fs');
	var path = require('path');
	var AWS = require('aws-sdk');
	var mmm = require('mmmagic');
	var magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);

	var ignores = {
		'.DS_Store': true
	};

	function isIgnored(filepath) {
		if (filepath in ignores) {
			return true;
		}
		return false;
	}

	function apply(filepath, sendFn) {
		fs.readdir(filepath, function (err, files) {
			if (err) {
				console.log(err, err.stack);
				return;
			}
			files.forEach(function (file) {
				if (isIgnored(file)) {
					return;
				}
				file = path.join(filepath, file);
				fs.stat(file, function (err, stats) {
					if (err) {
						console.log(err, err.stack);
						return;
					}
					if (stats.isDirectory()) {
						apply(file, sendFn);
					} else if (stats.isFile()) {
						fs.readFile(file, function (err, data) {
							if (err) {
								console.log(err, err.stack);
								return;
							}
							magic.detectFile(file, function (err, mimeType) {
								if (err) {
									console.log(err, err.stack);
									return;
								}
								sendFn(file, mimeType, data);
							});
						});
					}
				});
			});
		});
	}

	module.exports = function () {
		var config = this.config;
		var baseDir = this.base_dir;
		var publicDir = path.join(baseDir, config.public_dir);
		var s3 = new AWS.S3({
			region: config.deploy.region
		});
		apply(publicDir, function (filepath, mimeType, data) {
			filepath = filepath.replace(publicDir, '').replace(/^\//, '');
			s3.putObject({
				Bucket: config.deploy.bucket,
				Key: filepath,
				Body: data,
				ContentType: mimeType,
				ACL: ACL_PUBLIC_READ
			}, function (err, data) {
				if (err) {
//				console.log(err, err.stack);
					console.log('Upload Failed: ' + filepath);
				} else {
					console.log('Uploaded: ' + filepath);
				}
			});
		});
	};
})(module, require, console);
