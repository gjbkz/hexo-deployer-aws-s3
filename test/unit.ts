import {promises as afs} from 'fs';
import {tmpdir} from 'os';
import {Readable} from 'stream';
import test from 'ava';
import type {ExecutionContext} from 'ava';
import type {PutObjectRequest} from '@aws-sdk/client-s3';
import * as path from 'upath';
// eslint-disable-next-line import/no-relative-parent-imports
import {S3Mock} from '../src/S3Mock';

interface Deployment {
    region: string,
    bucket: string,
    test: string,
    prefix?: string,
    acl?: string,
}
interface Context {
    public_dir: string,
    log: {info: (message: string) => void},
}
type Deployer = (this: Context, deployment: Deployment) => Promise<void>;
const registration: {deployer?: Deployer} = {};
const deployer = {
    async call(context: Context, deployment: Deployment): Promise<void> {
        if (!registration.deployer) {
            throw new Error('Plugin was not registered');
        }
        await registration.deployer.call(context, deployment);
    },
};
Object.assign(global, {hexo: {extend: {deployer: {
    register(name: string, callback: Deployer) {
        if (name !== 'aws-s3') {
            throw new Error(`Unexpected deployer: ${name}`);
        }
        registration.deployer = callback;
    },
}}}});
// Register the real Hexo plugin; only the S3 transport is replaced below.
test.before(async () => {
    // eslint-disable-next-line import/no-relative-parent-imports, import/dynamic-import-chunkname
    await import('../src/index');
});

const setup = async (t: ExecutionContext) => {
    const directory = await afs.mkdtemp(path.join(tmpdir(), 'hexo-aws-s3-'));
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const original = S3Mock.prototype.putObject;
    t.teardown(async () => {
        S3Mock.prototype.putObject = original;
        await afs.rm(directory, {recursive: true, force: true});
    });
    const logs: Array<string> = [];
    const context: Context = {public_dir: directory, log: {info: (message) => logs.push(message)}};
    const deployment: Deployment = {region: 'us-east-1', bucket: 'example', test: directory};
    return {directory, logs, context, deployment};
};

const collectBody = async (request: PutObjectRequest): Promise<Buffer> => {
    if (!(request.Body instanceof Readable)) {
        throw new Error('Expected a readable upload body');
    }
    const chunks: Array<Buffer> = [];
    for await (const chunk of request.Body) {
        chunks.push(Buffer.from(chunk as Buffer));
    }
    return Buffer.concat(chunks);
};

test.serial('legacy configuration keeps public-read, keys, MIME types and binary contents', async (t) => {
    const fixture = await setup(t);
    await afs.mkdir(path.join(fixture.directory, 'images'));
    const binary = Buffer.from([0, 255, 1, 128]);
    await afs.writeFile(path.join(fixture.directory, 'images/logo.png'), binary);
    await afs.writeFile(path.join(fixture.directory, 'index.html'), '<h1>Hello</h1>');
    const requests: Array<{request: PutObjectRequest, body: Buffer}> = [];
    S3Mock.prototype.putObject = async function putObject(request) {
        t.is(this.config.region, 'us-east-1');
        requests.push({request, body: await collectBody(request)});
        return {};
    };
    await deployer.call(fixture.context, fixture.deployment);
    t.is(requests.length, 2);
    for (const {request, body} of requests) {
        t.is(request.Bucket, 'example');
        t.is(request.ACL, 'public-read');
        t.deepEqual(body, request.Key === 'index.html' ? Buffer.from('<h1>Hello</h1>') : binary);
        t.is(request.ContentType, request.Key === 'index.html' ? 'text/html' : 'image/png');
    }
    t.true(fixture.logs.includes('Uploaded 2 files'));
});

for (const acl of ['none', 'private', 'public-read', 'bucket-owner-full-control'] as const) {
    test.serial(`acl ${acl} with a prefix and empty file`, async (t) => {
        const fixture = await setup(t);
        await afs.writeFile(path.join(fixture.directory, 'empty.txt'), '');
        const requests: Array<PutObjectRequest> = [];
        S3Mock.prototype.putObject = async (request) => {
            requests.push(request);
            t.is((await collectBody(request)).length, 0);
            return {};
        };
        await deployer.call(fixture.context, {...fixture.deployment, acl, prefix: 'blog/resources'});
        t.is(requests.length, 1);
        t.is(requests[0].Key, 'blog/resources/empty.txt');
        if (acl === 'none') {
            t.false(Object.keys(requests[0]).includes('ACL'));
        } else {
            t.is(requests[0].ACL, acl);
        }
    });
}
