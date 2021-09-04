# Changelog

## v1.1.1 (2021-09-04)

### Tests

- increase timeout (#165) ([1a5c2fa](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/1a5c2fa3cf29c234613a4cadc8445fcd32bc9ebc))

### Continuous Integration

- skip ubuntu-latest x node 12 ([bbe53af](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/bbe53af8f3ee764fc7321b0ae91df1738d7152b9))
- try purge npm, nodejs ([7fc66ac](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/7fc66aca5536fbd8e2e0c94bf1b40f686d73244b))
- disable fail-fast ([96d91f5](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/96d91f517fb9cb20c592daaf0f4c39f1d2990e05))
- add concurrency field ([fdeda9e](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/fdeda9e8c1111b7c519ace3f17f3e11957fcf8d7))
- update ci workflows ([577a74a](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/577a74afe21c06b843deaa90026a77d0230f3450))

### Dependency Upgrades

- use aws-sdk v3 and fast-glob ([a4f04a3](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/a4f04a31a1c43245674ce02b8574c8509ad4d1f4))
- @nlib/changelog:0.1.9→0.1.10 @types/node:15.14.9→16.7.10 @typescript-eslint/parser:4.29.3→4.30.0 aws-sdk:2.968.0→2.983.0 globby:11.0.3→12.0.2 ([0ec0f02](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/0ec0f02e6075e243e09eac7c1d52537e08249d43))
- @nlib/eslint-config:3.17.21→3.17.22 aws-sdk:2.897.0→2.903.0 esl… (#81) ([d149bbd](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/d149bbd84ec5faf625620640455197bb8e3c868b))


## v1.1.0 (2021-05-02)

### Tests

- use npm install instead of symlink ([817b2e8](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/817b2e899e778fddc6f8d9d47c7b51a57a13d0be))
- print hexo output ([8c6578f](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/8c6578ffe7d9ca75c7af54936be302e01778444e))

### Code Refactoring

- import all ([3679282](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/3679282bf4b32cafe837830fb3b9d5337e32e89e))
- use fs.promises ([aa0d434](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/aa0d4341a9268b8106aa7205f14082837244b870))
- rewrite tests ([2450c3b](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/2450c3b020e2a28a4dc91fd85c5ba97d2679c799))
- update scripts ([b0bc54e](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/b0bc54e1b91189aeb2ca7c6d10eeffa2e4ea62fb))
- fix eslint errors ([16e5eb2](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/16e5eb207b78985f3e0b2a7671a5563efa7eb745))

### Documentation

- update badges ([9c228e6](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/9c228e661c3c35dfac93a3b7e0e8a20c6a220b08))
- update README ([b9293a6](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/b9293a66f16e895682b5f46c72dbfa328059ed28))

### Continuous Integration

- specify environment ([f771975](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/f7719753449798ca0f63911bb3ed6e993dda6a26))
- install hexo before test ([da9b468](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/da9b46839339f81342678c623c718cb00a47b52c))
- setup github actions ([14f5662](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/14f5662d256b4fb4ca15457636e0c34f8bc837b4))

### Dependency Upgrades

- upgrade dependencies ([70c2cdb](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/70c2cdb71db6ee3271341f82379188791338e2f8))
- move type definitions to devDependencies ([58cd26f](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/58cd26f2a7c79d436b9c73110d440a9f2c9fcad0))


## v1.0.2 (2019-07-15)

### Documentation

- add the appveyor badge ([86ac825](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/86ac825c4d502ab599a945e4724a1e5a6c36d2c3))


## v1.0.1 (2019-06-08)


## v1.0.0 (2019-06-05)


## v0.3.5 (2019-02-12)

### Bug Fixes

- include type definitions ([a946301](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/a946301102785253d9691524d752c8376e4f867c))


## v0.3.4 (2019-02-12)

### Bug Fixes

- skip cleanup ([927cb15](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/927cb15f8a7145b5eb94754fb986e9772b8a0649))

### Documentation

- update README ([54d92b4](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/54d92b40e90349618974ddf3625c71bcee2ff05d))


## v0.3.3 (2019-02-04)

### Bug Fixes

- don't use utf-8 for reading file's content (#15) ([41e9fd3](https://github.com/kei-ito/hexo-deployer-aws-s3/commit/41e9fd3bdfaa61009dccc0661e9906074eed4381))


## v0.3.2 (2018-10-18)


## v0.3.1 (2018-10-18)


## v0.3.0 (2018-09-10)


