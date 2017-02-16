var assert = require('assert');
var S3 = require('../s3');

describe('S3', function () {

	it('should be a S3Mock', function () {
		var s3 = new S3({});
		assert.equal(s3.isMock, true);
	});

	it('should emit an event on calling putObject()', function (done) {
		var config = {};
		var params = {};
		var s3 = new S3(config);
		s3.on('putObject', function (eventData) {
				try {
					assert.equal(this.config, config);
					assert.equal(eventData, params);
				} catch (error) {
					done(error);
				}
			});
		s3.putObject(params, function () {
			done();
		});
	});

});
