import {EventEmitter} from 'events';
import type {S3} from 'aws-sdk';
import * as path from 'upath';
import {createWriteStream, promises as afs} from 'fs';
import {Readable} from 'stream';

interface PutObjectOutput {
    promise: () => Promise<S3.Types.PutObjectOutput>,
}

const writeFileStream = async (file: string, body: Readable): Promise<void> => {
    await new Promise((resolve, reject) => {
        body.pipe(createWriteStream(file))
        .once('error', reject)
        .once('finish', resolve);
    });
};

export class S3Mock extends EventEmitter {

    public readonly output: string;

    public readonly config: S3.Types.ClientConfiguration;

    public constructor(
        output: string,
        config: S3.Types.ClientConfiguration = {},
    ) {
        super();
        this.output = output;
        this.config = config;
    }

    public putObject(
        params: S3.Types.PutObjectRequest,
        callback?: () => void,
    ): PutObjectOutput {
        const {Body, Bucket, Key} = params;
        const {region = 'undefined'} = this.config;
        if (!(Body instanceof Readable)) {
            throw new Error('Body should be instance of Readable');
        }
        const dest = path.join(this.output, region, Bucket, Key);
        this.emit('putObject', params);
        const promise = afs.mkdir(path.dirname(dest), {recursive: true})
        .then(async () => {
            await Promise.all([
                writeFileStream(dest, Body),
                afs.writeFile(`${dest}.json`, JSON.stringify(params, null, 2)),
            ]);
        })
        .then(() => {
            if (callback) {
                callback();
            }
            return {};
        });
        return {promise: async () => await promise};
    }

}
