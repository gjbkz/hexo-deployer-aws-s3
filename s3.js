var path = require('path');
var EventEmitter = require('events');
var util = require('util');
var isTest = false;
var parent = module.parent;

while (parent) {
	if (parent.id.indexOf(path.join(__dirname, 'test')) === 0) {
		isTest = true;
		break;
	}
	parent = parent.parent;
}

function S3Mock(config) {
	EventEmitter.call(this);
	this.config = config;
}

util.inherits(S3Mock, EventEmitter);

S3Mock.prototype.isMock = true;

S3Mock.prototype.putObject = function (params, callback) {
	this.emit('putObject', params);
	callback();
};

S3Mock.S3 = require('aws-sdk').S3;

module.exports = isTest ? S3Mock : S3Mock.S3;
