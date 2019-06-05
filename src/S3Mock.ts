import {EventEmitter} from 'events';
import {S3 as AWSS3} from 'aws-sdk';
import {join, dirname} from 'path';
import {createWriteStream} from 'fs';
import {Readable} from 'stream';
import {mkdirp, writeFile} from './fs';

interface IMyPutObjectOutput {
    promise: () => Promise<AWSS3.Types.PutObjectOutput>,
}

const writeFileStream = (file: string, body: Readable): Promise<void> => new Promise((resolve, reject) => {
    body.pipe(createWriteStream(file))
    .once('error', reject)
    .once('finish', resolve);
});

export class S3Mock extends EventEmitter {

    public readonly output: string;

    public readonly config: AWSS3.Types.ClientConfiguration;

    public constructor(
        output: string,
        config: AWSS3.Types.ClientConfiguration = {},
    ) {
        super();
        this.output = output;
        this.config = config;
    }

    public putObject(
        params: AWSS3.Types.PutObjectRequest,
        callback?: () => {},
    ): IMyPutObjectOutput {
        const {Body, Bucket, Key} = params;
        const {region = 'undefined'} = this.config;
        if (!(Body instanceof Readable)) {
            throw new Error('Body should be instance of Readable');
        }
        const dest = join(this.output, region, Bucket, Key);
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
