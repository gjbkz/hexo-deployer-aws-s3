const t = require('tap');
const {S3Client, PutObjectCommand} = require('../lib/s3.js');

t.test('S3Client', (t) => {

    t.test('should be a S3MockClient', (t) => {
        const s3 = new S3Client();
        t.equal(s3.isMock, true);
        t.end();
    });

    t.test('should emit an event on calling send() with PutObjectCommand', (t) => {
        const config = {};
        const params = {Bucket: 'test', Key: 'test'};
        const s3 = new S3Client(config);
        s3.on('putObject', (eventData) => {
            try {
                t.equal(s3.config, config);
                t.same(eventData, params);
            } catch (error) {
                t.threw(error);
            }
            t.end();
        });
        s3.send(new PutObjectCommand(params));
    });

    t.end();

});
