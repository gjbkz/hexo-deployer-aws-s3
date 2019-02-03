const {deployer} = require('./lib/deployer.js');
hexo.extend.deployer.register('aws-s3', deployer);
