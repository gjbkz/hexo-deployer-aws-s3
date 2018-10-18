const {deployer} = require('./deployer.js');
hexo.extend.deployer.register('aws-s3', deployer);
