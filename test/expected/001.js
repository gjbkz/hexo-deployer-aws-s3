var path = require('path');
var fs = require('fs');

var rootDir = path.join(__dirname, '..');

module.exports = [
	[path.join('2000', '01', '01', 'index.html'), 'text/html'],
	[path.join('deployer.js'), 'application/javascript'],
	[path.join('expected', '001.js'), 'application/javascript'],
	[path.join('index.html'), 'text/html'],
	[path.join('s3.js'), 'application/javascript']
].map(function (file) {
	return {
		Key: file[0],
		ACL: 'public-read',
		Bucket: 'hexo-deployer-s3-test-001',
		ContentType: file[1],
		Body: fs.readFileSync(path.join(rootDir, file[0]), 'utf8')
	};
});
