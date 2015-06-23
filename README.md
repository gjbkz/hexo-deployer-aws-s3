# hexo-deployer-aws-s3
AWS S3 deployer plugin for [Hexo].

## Installation

``` bash
$ npm install hexo-deployer-aws-s3 --save
```

## Setup

We must provide 4 parameters below to the AWS SDK.

1. **accessKeyId**
2. **secretAccessKey**
3. **region**
4. **bucket**

You can set **region** and **bucket** in `_config.yml`

``` yaml
deploy:
  type: aws-s3
  region: <region>
  bucket: <bucket>
```

You can't set **accessKeyId** and **secretAccessKey** in this plugin. Instead, you can set them via global settings below.

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