# hexo-deployer-aws-s3

[![Test](https://github.com/kei-ito/hexo-deployer-aws-s3/actions/workflows/workflow.yml/badge.svg)](https://github.com/kei-ito/hexo-deployer-aws-s3/actions/workflows/workflow.yml)
[![codecov](https://codecov.io/gh/kei-ito/hexo-deployer-aws-s3/branch/master/graph/badge.svg)](https://codecov.io/gh/kei-ito/hexo-deployer-aws-s3)

AWS S3 deployer plugin for [Hexo](http://hexo.io/).

## Installation

``` bash
$ npm install hexo-deployer-aws-s3 --save-dev
```

## Setup

### 1. Configurations

Put the `deploy` configurations to `_config.yml`.

``` yaml
deploy:
  type: aws-s3             # The name of this plugin
  region: us-east-1        # The region where your bucket is located
  bucket: my-bucket        # The name of your bucket
  prefix: blog-resources   # The s3 key prefix
```

### 2. Credentials

This plugin does not handle AWS credentials. Please set your credentials according to the [AWS documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html).

## Usage

``` bash
$ hexo deploy
```

## License
MIT
