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
      concurrency: 8          # Maximum number of concurrent uploads
```

| Option | Description | Default |
| --- | --- | --- |
| `region` | AWS region of the bucket; a non-empty string is required | Required |
| `bucket` | Destination bucket name; a non-empty string is required | Required |
| `prefix` | Prefix added to uploaded object keys | Empty string |
| `acl` | `none` to omit the ACL, or a supported S3 object canned ACL | `public-read` |
| `concurrency` | Maximum concurrent uploads; a positive safe integer | `8` |
| `glob` | Options passed to [fast-glob](https://github.com/mrmlnc/fast-glob#options-3); uploads always include files only | fast-glob defaults |

### Object ownership and public access

New S3 buckets disable ACLs by default (Bucket owner enforced). Use `acl: none`
for these buckets. The plugin omits the `ACL` request field entirely; it does not
send an ACL named `none`. An empty `acl:` value or `acl: null` is invalid.

For compatibility with existing sites, omitting `acl` still sends `public-read`.
Existing configurations such as the following keep their previous ACL behavior:

```yaml
deploy:
  type: aws-s3
  region: us-east-1
  bucket: existing-public-site
```

Supported ACL values are `none`, `private`, `public-read`, `public-read-write`,
`authenticated-read`, `aws-exec-read`, `bucket-owner-read`, and
`bucket-owner-full-control`. Prefer `none` and manage access with policies for
new deployments.

Uploading an object does not necessarily make it publicly readable. For a public
S3 website with ACLs disabled, configure a suitable bucket policy and public-access
settings. For a private S3 origin behind CloudFront, use `acl: none` and configure
CloudFront origin access control and a bucket policy allowing the distribution.
If an existing website relies on `public-read` ACLs, configure policy-based access
before switching to `none`, or overwritten objects may become inaccessible.

The plugin does not change bucket policies, Object Ownership, or Block Public
Access, and does not retry a failed public ACL upload without its ACL.
See [S3 Object Ownership](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html)
and [CloudFront origin access control](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html).

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

All matching files are uploaded on every deployment. Files removed locally are
not deleted from S3. On an upload failure, the plugin stops scheduling new files,
waits for in-flight uploads, and rejects the deployment. Files already uploaded
remain in S3; deployments are not atomic.

## License
MIT
