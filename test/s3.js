const t = require('tap');
const {S3} = require('../s3.js');

t.test('S3', (t) => {

    t.test('should be a S3Mock', (t) => {
        const s3 = new S3();
        t.equal(s3.isMock, true);
        t.end();
    });

    t.test('should emit an event on calling putObject()', (t) => {
        const config = {};
        const params = {};
        const s3 = new S3(config);
        s3.on('putObject', (eventData) => {
            try {
                t.equal(s3.config, config);
                t.equal(eventData, params);
            } catch (error) {
                t.threw(error);
            }
        });
        s3.putObject(params, () => {
            t.end();
        });
    });

    t.end();

});
