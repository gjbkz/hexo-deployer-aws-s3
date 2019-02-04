import {EventEmitter} from 'events';
import {S3 as AWSS3} from 'aws-sdk';
import {join, dirname} from 'path';
import $mkdirp = require('mkdirp');
import {writeFile as $writeFile, createWriteStream} from 'fs';
import {Readable} from 'stream';

interface MyPutObjectOutput {
    promise: () => Promise<AWSS3.Types.PutObjectOutput>,
}

const mkdirp = (directory: string): Promise<void> => new Promise((resolve, reject) => {
    $mkdirp(directory, (error) => {
        if (error) {
            reject(error);
        } else {
            resolve();
        }
    });
});

const writeFile = (file: string, body: string | Buffer): Promise<void> => new Promise((resolve, reject) => {
    $writeFile(file, body, (error) => {
        if (error) {
            reject(error);
        } else {
            resolve();
        }
    });
});

const writeFileStream = (file: string, body: Readable): Promise<void> => new Promise((resolve, reject) => {
    body.pipe(createWriteStream(file))
    .once('error', reject)
    .once('finish', resolve);
});

export class S3Mock extends EventEmitter {

    public readonly output: string

    public readonly config: AWSS3.Types.ClientConfiguration

    public constructor(output: string, config: AWSS3.Types.ClientConfiguration = {}) {
        super();
        this.output = output;
        this.config = config;
    }

    public putObject(
        params: AWSS3.Types.PutObjectRequest,
        callback?: () => {},
    ): MyPutObjectOutput {
        const {Body, Bucket, Key} = params;
        const {region = 'undefined'} = this.config;
        if (!(Body instanceof Readable)) {
            throw new Error('Body should be instance of Readable');
        }
        const dest = join(this.output, region, Bucket, Key);
        console.log(dest);
        this.emit('putObject', params);
        const promise = mkdirp(dirname(dest))
        .then(() => Promise.all([
            writeFileStream(dest, Body),
            writeFile(`${dest}.json`, JSON.stringify(params, null, 2)),
        ]))
        .then(() => {
            if (callback) {
                callback();
            }
            return {};
        });
        return {promise: () => promise};
    }

}
