import {promises as afs} from 'fs';
import {tmpdir} from 'os';
import {Readable} from 'stream';
import test from 'ava';
import type {PutObjectRequest, PutObjectOutput} from '@aws-sdk/client-s3';
import * as path from 'upath';
import {S3Mock} from '../src/S3Mock';

type Deployment = {
    region: string,
    bucket: string,
    test: string,
    prefix?: string,
    acl?: unknown,
    concurrency?: unknown,
};
type Context = {public_dir: string, log: {info: (message: string) => void}};
type Deployer = (this: Context, deployment: Deployment) => Promise<void>;
let deployer: Deployer;
Object.assign(global, {hexo: {extend: {deployer: {
    register(name: string, callback: Deployer) {
        if (name !== 'aws-s3') {
            throw new Error(`Unexpected deployer: ${name}`);
        }
        deployer = callback;
    },
}}}});
// Register the real Hexo plugin; only the S3 transport is replaced below.
require('../src/index');

const setup = async () => {
    const directory = await afs.mkdtemp(path.join(tmpdir(), 'hexo-aws-s3-'));
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
    const fixture = await setup();
    const original = S3Mock.prototype.putObject;
    t.teardown(async () => {
        S3Mock.prototype.putObject = original;
        await afs.rm(fixture.directory, {recursive: true, force: true});
    });
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

for (const acl of ['none', 'private', 'public-read', 'bucket-owner-full-control']) {
    test.serial(`acl ${acl} with a prefix and empty file`, async (t) => {
        const fixture = await setup();
        const original = S3Mock.prototype.putObject;
        t.teardown(async () => {
            S3Mock.prototype.putObject = original;
            await afs.rm(fixture.directory, {recursive: true, force: true});
        });
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
            t.false(Object.prototype.hasOwnProperty.call(requests[0], 'ACL'));
        } else {
            t.is(requests[0].ACL, acl);
        }
    });
}

test.serial('invalid configuration fails before opening files or uploading', async (t) => {
    const fixture = await setup();
    const original = S3Mock.prototype.putObject;
    t.teardown(async () => {
        S3Mock.prototype.putObject = original;
        await afs.rm(fixture.directory, {recursive: true, force: true});
    });
    S3Mock.prototype.putObject = async () => {
        t.fail('Invalid configuration must not upload');
        return {};
    };
    for (const invalid of [
        {bucket: ''}, {bucket: ' '}, {region: ''},
        {acl: null}, {acl: ''}, {acl: 'invalid'},
        {concurrency: null}, {concurrency: '8'}, {concurrency: 0},
        {concurrency: -1}, {concurrency: 1.5}, {concurrency: Infinity},
    ]) {
        await t.throwsAsync(deployer.call(fixture.context, {...fixture.deployment, ...invalid}), {message: /^aws-s3:/});
    }
    t.deepEqual(fixture.logs, []);
});

for (const concurrency of [undefined, 1, 3]) {
    test.serial(`upload concurrency is bounded (${String(concurrency)})`, async (t) => {
        const fixture = await setup();
        const original = S3Mock.prototype.putObject;
        t.teardown(async () => {
            S3Mock.prototype.putObject = original;
            await afs.rm(fixture.directory, {recursive: true, force: true});
        });
        await Promise.all(Array.from({length: 12}, async (_, i) => afs.writeFile(path.join(fixture.directory, `${i}.txt`), `${i}`)));
        let active = 0;
        let maximum = 0;
        let completed = 0;
        S3Mock.prototype.putObject = async (request) => {
            active += 1;
            maximum = Math.max(maximum, active);
            await collectBody(request);
            active -= 1;
            completed += 1;
            return {};
        };
        await deployer.call(fixture.context, {...fixture.deployment, concurrency});
        t.is(maximum, concurrency ?? 8);
        t.is(completed, 12);
        t.is(active, 0);
    });
}

test.serial('an upload failure stops new work and waits for in-flight uploads', async (t) => {
    const fixture = await setup();
    const original = S3Mock.prototype.putObject;
    t.teardown(async () => {
        S3Mock.prototype.putObject = original;
        await afs.rm(fixture.directory, {recursive: true, force: true});
    });
    await Promise.all(['a.txt', 'b.txt', 'c.txt'].map(async (name) => afs.writeFile(path.join(fixture.directory, name), name)));
    const error = new Error('Access denied');
    let started = 0;
    let finished = 0;
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => { release = resolve; });
    S3Mock.prototype.putObject = async (request): Promise<PutObjectOutput> => {
        started += 1;
        if (started === 1) {
            // Let the other worker start before reporting the first failure.
            await new Promise<void>((resolve) => setImmediate(resolve));
            release();
            throw error;
        }
        await gate;
        await collectBody(request);
        finished += 1;
        return {};
    };
    await t.throwsAsync(deployer.call(fixture.context, {...fixture.deployment, concurrency: 2}), {is: error});
    t.is(started, 2);
    t.is(finished, 1);
    t.true(fixture.logs.some((message) => message.startsWith('Failed to upload ')));
    t.false(fixture.logs.some((message) => /^Uploaded \d+ files$/.test(message)));
});

test.serial('an empty directory completes without uploading', async (t) => {
    const fixture = await setup();
    t.teardown(async () => afs.rm(fixture.directory, {recursive: true, force: true}));
    await deployer.call(fixture.context, fixture.deployment);
    t.deepEqual(fixture.logs, ['Found 0 files', 'Uploaded 0 files']);
});
