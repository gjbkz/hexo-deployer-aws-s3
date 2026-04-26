const path = require('path');
const EventEmitter = require('events');
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');

exports.S3Client = S3Client;
exports.PutObjectCommand = PutObjectCommand;

class S3MockClient extends EventEmitter {

    constructor(config = {}) {
        super();
        this.config = config;
        this.isMock = true;
    }

    async send(command) {
        if (command instanceof PutObjectCommand) {
            this.emit('putObject', command.input);
        }
        return {};
    }

}

let parent = module;
while (parent) {
    if (path.normalize(parent.filename).includes(path.join(__dirname, '../test'))) {
        exports.S3Client = S3MockClient;
        break;
    }
    ({parent} = parent);
}
