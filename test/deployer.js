var assert = require('assert');
var deployer = require('../deployer');

describe('deployer', function () {

	it('should upload files in public_dir', function () {
		return new Promise(function (resolve, reject) {
			var uploadedFiles = [];
			deployer.call({
				public_dir: __dirname,
				log: {
					info: function (message) {
						console.log(message);
						if (/Uploaded \d+ files/.test(message)) {
							resolve(uploadedFiles.sort(function (a, b) {
								return a.Key < b.Key ? -1 : 1;
							}));
						}
					},
					error: reject
				}
			}, {
				bucket: 'hexo-deployer-s3-test-001',
				isTest: function (s3) {
					s3
						.on('putObject', function (params) {
							params.Body = params.Body.toString();
							uploadedFiles.push(params);
						});
				}
			});
		})
			.then(function (uploadedFiles) {
				assert.deepEqual(uploadedFiles, require('./expected/001'));
			});
	});

});
