# hexo-deployer-aws-s3

[![CircleCI](https://circleci.com/gh/kei-ito/hexo-deployer-aws-s3.svg?style=svg)](https://circleci.com/gh/kei-ito/hexo-deployer-aws-s3)
[![Build Status](https://travis-ci.com/kei-ito/hexo-deployer-aws-s3.svg?branch=master)](https://travis-ci.com/kei-ito/hexo-deployer-aws-s3)
[![Build status](https://ci.appveyor.com/api/projects/status/novh4n5r73xvrsl0?svg=true)](https://ci.appveyor.com/project/kei-ito/hexo-deployer-aws-s3)
[![codecov](https://codecov.io/gh/kei-ito/hexo-deployer-aws-s3/branch/master/graph/badge.svg)](https://codecov.io/gh/kei-ito/hexo-deployer-aws-s3)

AWS S3 deployer plugin for [Hexo](http://hexo.io/).

## Installation

``` bash
$ npm install hexo-deployer-aws-s3 --save-dev
```

## Setup

### Configurations

Put the `deploy` configurations to `_config.yml`.

``` yaml
deploy:
  type: aws-s3             # The name of this plugin
  region: us-east-1        # The region where your bucket is located
  bucket: my-bucket        # The name of your bucket
  prefix: blog-resources   # The s3 key prefix
```

### Credentials

This plugin does not handle AWS credentials. Please set your credentials according to the [AWS documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html).

## Usage

``` bash
$ hexo deploy
```

## License
MIT
