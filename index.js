const {deployer} = require('./js/deployer.js');
hexo.extend.deployer.register('aws-s3', deployer);
