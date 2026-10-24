# hexo-deployer-aws-s3

[![Test](https://github.com/gjbkz/hexo-deployer-aws-s3/actions/workflows/test.yml/badge.svg)](https://github.com/gjbkz/hexo-deployer-aws-s3/actions/workflows/test.yml)

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
  acl: none               # Omit ACLs for buckets with ACLs disabled
```

Use `acl: none` for buckets with ACLs disabled; the plugin omits the ACL from
upload requests. Omitting `acl` sends `public-read` for compatibility with existing
sites. If your site relies on `public-read`, configure a bucket policy granting
read access before switching to `none`.

### 2. Credentials

Credentials are resolved by the AWS SDK's default credential provider chain,
including environment variables, shared AWS profiles, and IAM roles. Do not put
access keys in `_config.yml`. See the [AWS SDK v3 documentation](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html).

The deployment identity needs `s3:PutObject` for the destination prefix, and
`s3:PutObjectAcl` when sending an ACL. Additional permissions can be required by
your bucket's encryption or cross-account policies.

## Usage

``` bash
$ hexo deploy
```

## License
MIT
