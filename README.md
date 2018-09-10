# hexo-deployer-aws-s3

[![Build Status](https://travis-ci.org/kei-ito/hexo-deployer-aws-s3.svg?branch=master)](https://travis-ci.org/kei-ito/hexo-deployer-aws-s3)
[![codecov](https://codecov.io/gh/kei-ito/hexo-deployer-aws-s3/branch/master/graph/badge.svg)](https://codecov.io/gh/kei-ito/hexo-deployer-aws-s3)
[![Greenkeeper badge](https://badges.greenkeeper.io/kei-ito/hexo-deployer-aws-s3.svg)](https://greenkeeper.io/)

AWS S3 deployer plugin for [Hexo].

## Installation

``` bash
$ npm install hexo-deployer-aws-s3 --save
```

## Setup

We must provide 4 parameters to the AWS SDK.

1. **accessKeyId**
2. **secretAccessKey**
3. **region**
4. **bucket**

You can provide **region** and **bucket** from `_config.yml`

``` yaml
deploy:
  type: aws-s3
  region: <region>
  bucket: <bucket>
```

You can't provide **accessKeyId** and **secretAccessKey** from this plugin.
Instead, you can provide them from global settings below.

- Credentials File: `~/.aws/credentials`
- Environment Variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

For more, see [Configuring the SDK in Node.js].

[Hexo]: http://hexo.io/
[Configuring the SDK in Node.js]: http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html

## Usage

``` bash
$ hexo deploy
```

## License
MIT
