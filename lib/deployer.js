/* global module, require, console */
(function (module, require, console) {

	'use strict';

	var ACL_PUBLIC_READ = 'public-read';

	var fs = require('fs');
	var path = require('path');
	var AWS = require('aws-sdk');
	var mime = require('mime');
	var upath = require('upath');

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
							sendFn(file, data);
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
		apply(publicDir, function (filepath, data) {
			var mimeType = mime.lookup(filepath);
			filepath = filepath.replace(publicDir, '').replace(/^\//, '');
			s3.putObject({
				Bucket: config.deploy.bucket,
				Key: upath.toUnix(filepath),
				Body: data,
				ContentType: mimeType,
				ACL: ACL_PUBLIC_READ
			}, function (err, data) {
				if (err) {
					console.log(err, err.stack);
					console.log('Upload Failed: ' + filepath + ' [' + mimeType + ']');
				} else {
					console.log('Uploaded: ' + filepath + ' [' + mimeType + ']');
				}
			});
		});
	};
})(module, require, console);
