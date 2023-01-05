import {EventEmitter} from 'events';
import {createWriteStream, promises as afs} from 'fs';
import {Readable} from 'stream';
import type * as S3 from '@aws-sdk/client-s3';
import * as path from 'upath';

const writeFileStream = async (file: string, body: Readable): Promise<void> => {
    await new Promise((resolve, reject) => {
        body.pipe(createWriteStream(file))
        .once('error', reject)
        .once('finish', resolve);
    });
};

export class S3Mock extends EventEmitter {

    public readonly output: string;

    public readonly config: S3.S3ClientConfig;

    public constructor(
        output: string,
        config: S3.S3ClientConfig = {},
    ) {
        super();
        this.output = output;
        this.config = config;
    }

    public async putObject(
        params: S3.PutObjectRequest,
    ): Promise<S3.PutObjectOutput> {
        const {Body, Bucket, Key} = params;
        const {region = 'undefined'} = this.config;
        if (!(Body instanceof Readable)) {
            throw new Error('Body should be instance of Readable');
        }
        const dest = path.join(this.output, region, Bucket, Key);
        this.emit('putObject', params);
        await afs.mkdir(path.dirname(dest), {recursive: true});
        await Promise.all([
            writeFileStream(dest, Body),
            afs.writeFile(`${dest}.json`, JSON.stringify(params, null, 2)),
        ]);
        return {};
    }

}
