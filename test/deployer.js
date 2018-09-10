const console = require('console');
const t = require('tap');
const {deployer} = require('../deployer.js');
const expectedFiles = require('./expected.js');

t.test('deployer', (t) => new Promise((resolve, reject) => {
    const uploadedFiles = [];
    deployer.call(
        {
            public_dir: __dirname,
            log: {
                info: (message) => {
                    console.log(message);
                    if ((/Uploaded \d+ files/).test(message)) {
                        resolve(uploadedFiles.sort((a, b) => a.Key < b.Key ? -1 : 1));
                    }
                },
                error: reject,
            },
        },
        {
            bucket: 'hexo-deployer-s3-test-001',
            isTest: (s3) => {
                s3.on('putObject', (params) => {
                    params.Body = params.Body.toString();
                    uploadedFiles.push(params);
                });
            },
        }
    );
})
.then((uploadedFiles) => {
    t.equal(uploadedFiles.length, expectedFiles.length);
    while (0 < uploadedFiles.length) {
        const actual = uploadedFiles.shift();
        const expected = expectedFiles.shift();
        for (const key of Object.keys(expected)) {
            t.match(actual[key], expected[key], key);
        }
    }
}));
