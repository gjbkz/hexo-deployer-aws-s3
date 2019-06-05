import * as path from 'path';
import * as os from 'os';
import anyTest, {TestInterface} from 'ava';
import {mkdirp, mkdtemp, stat} from './fs';

const test = anyTest as TestInterface<{
    directory: string,
}>;

test.beforeEach(async (t) => {
    t.context.directory = await mkdtemp(path.join(os.tmpdir(), 'fs-test-'));
});

interface ITest {
    input: string,
}

([
    {input: '/foo'},
    {input: '/foo/bar/baz'},
] as Array<ITest>).forEach(({input}) => {
    test(`mkdirp(${JSON.stringify(input)})`, async (t) => {
        const absoluteInput = path.join(t.context.directory, input);
        await mkdirp(absoluteInput);
        const stats = await stat(absoluteInput);
        t.true(stats.isDirectory());
    });
});
