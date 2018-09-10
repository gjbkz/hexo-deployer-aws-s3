const path = require('path');
const EventEmitter = require('events');
const AWS = require('aws-sdk');

exports.S3 = AWS.S3;

class S3Mock extends EventEmitter {

    static get S3() {
        return AWS.S3;
    }

    constructor(config = {}) {
        super();
        this.config = config;
        this.isMock = true;
    }

    putObject(params, callback) {
        this.emit('putObject', params);
        if (callback) {
            callback();
        }
        return {promise: () => Promise.resolve()};
    }

}

let parent = module;
while (parent) {
    if (parent.filename.indexOf(path.join(__dirname, 'test')) === 0) {
        exports.S3 = S3Mock;
        break;
    }
    ({parent} = parent);
}
