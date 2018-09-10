const path = require('path');
const fs = require('fs');
const rootDir = __dirname;

module.exports = [
    [path.normalize('2000/01/01/index.html'), 'text/html'],
    [path.normalize('deployer.js'), 'application/javascript'],
    [path.normalize('expected.js'), 'application/javascript'],
    [path.normalize('index.html'), 'text/html'],
    [path.normalize('s3.js'), 'application/javascript'],
]
.map(([Key, ContentType]) => ({
    Key,
    ACL: 'public-read',
    Bucket: 'hexo-deployer-s3-test-001',
    ContentType,
    Body: fs.readFileSync(path.join(rootDir, Key), 'utf8'),
}));
