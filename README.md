# hexo-deployer-aws-s3

[![Greenkeeper badge](https://badges.greenkeeper.io/kei-ito/hexo-deployer-aws-s3.svg)](https://greenkeeper.io/)

AWS S3 deployer plugin for [Hexo].

[![Build Status](https://travis-ci.org/kei-ito/hexo-deployer-aws-s3.svg?branch=master)](https://travis-ci.org/kei-ito/hexo-deployer-aws-s3)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/479b379434e0459c8437d2d217558b6c)](https://www.codacy.com/app/kei.itof/hexo-deployer-aws-s3?utm_source=github.com&utm_medium=referral&utm_content=kei-ito/hexo-deployer-aws-s3&utm_campaign=badger)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/479b379434e0459c8437d2d217558b6c)](https://www.codacy.com/app/kei.itof/hexo-deployer-aws-s3?utm_source=github.com&utm_medium=referral&utm_content=kei-ito/hexo-deployer-aws-s3&utm_campaign=Badge_Coverage)
o-deployer-aws-s3/coverage)
[![dependencies Status](https://david-dm.org/kei-ito/hexo-deployer-aws-s3/status.svg)](https://david-dm.org/kei-ito/hexo-deployer-aws-s3)

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
