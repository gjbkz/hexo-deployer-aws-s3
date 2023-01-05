import {promises as afs} from 'fs';
import {execSync} from 'child_process';
import test from 'ava';
import * as path from 'upath';

const projectRoot = path.join(__dirname, '..');
const projectDirectory = path.join(projectRoot, 'test/project');

test.before((t) => {
    const cwd = projectDirectory;
    const result1 = execSync('npm run generate', {cwd});
    t.log(result1);
    const result2 = execSync('npm run deploy', {cwd});
    t.log(result2);
});

test('compare files', async (t) => {
    const publicDirectory = path.join(projectDirectory, 'public');
    const s3Directory = path.join(projectDirectory, 'test-output/us-east-1/test');
    const testDirectory = async (directory: string): Promise<void> => {
        for (const name of await afs.readdir(directory)) {
            const file = path.join(directory, name);
            const stats = await afs.stat(file);
            if (stats.isDirectory()) {
                await testDirectory(file);
            } else {
                t.log(file);
                const source = await afs.readFile(file);
                const uploaded = await afs.readFile(path.join(s3Directory, path.relative(publicDirectory, file)));
                t.is(uploaded.length, source.length);
                t.true(uploaded.equals(source), `Failed: ${file}`);
            }
        }
    };
    await testDirectory(publicDirectory);
});
