import {promises as afs} from 'fs';
import test from 'ava';
import {exec} from '@nlib/nodetool';
import {join, relative} from 'path';

const projectRoot = join(__dirname, '..');
const projectDirectory = join(projectRoot, 'test/project');

test.before(async (t) => {
    const cwd = projectDirectory;
    const result1 = await exec('npm run generate', {cwd});
    t.log(result1.stdout, result1.stderr);
    const result2 = await exec('npm run deploy', {cwd});
    t.log(result2.stdout, result2.stderr);
});

test('compare files', async (t) => {
    const publicDirectory = join(projectDirectory, 'public');
    const s3Directory = join(projectDirectory, 'test-output/us-east-1/test');
    const testDirectory = async (directory: string): Promise<void> => {
        for (const name of await afs.readdir(directory)) {
            const file = join(directory, name);
            const stats = await afs.stat(file);
            if (stats.isDirectory()) {
                await testDirectory(file);
            } else {
                t.log(file);
                const source = await afs.readFile(file);
                const uploaded = await afs.readFile(join(s3Directory, relative(publicDirectory, file)));
                t.is(uploaded.length, source.length);
                t.true(uploaded.equals(source), `Failed: ${file}`);
            }
        }
    };
    await testDirectory(publicDirectory);
});
