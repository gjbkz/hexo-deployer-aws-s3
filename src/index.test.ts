import test from 'ava';
import {join, relative, extname} from 'path';
import * as childProcess from 'child_process';
import {readdir, stat, readFile} from './fs';

import * as stream from 'stream';

interface ISpawnParameters {
    command: string,
    args?: Array<string>,
    options?: childProcess.SpawnOptionsWithoutStdio,
    stdout?: stream.Writable,
    stderr?: stream.Writable,
}

const spawn = (
    parameters: ISpawnParameters,
): Promise<void> => new Promise((resolve, reject) => {
    const subProcess = childProcess.spawn(
        parameters.command,
        parameters.args || [],
        parameters.options || {},
    )
    .once('error', reject)
    .once('exit', (code) => {
        if (code === 0) {
            resolve();
        } else {
            reject(new Error(`The command "${parameters.command}" exited with code ${code}.`));
        }
    });
    if (subProcess.stdout) {
        subProcess.stdout.pipe(parameters.stdout || process.stdout);
    }
    if (subProcess.stderr) {
        subProcess.stderr.pipe(parameters.stderr || process.stderr);
    }
});

const projectRoot = join(__dirname, '..');
const projectDirectory = join(projectRoot, 'test/project');

test.before(async () => {
    await spawn({
        command: 'npm run generate',
        options: {
            cwd: projectDirectory,
            shell: true,
        },
    });
    await spawn({
        command: 'npm run deploy',
        options: {
            cwd: projectDirectory,
            shell: true,
        },
    });
});

test('compare files', async (t) => {
    const publicDirectory = join(projectDirectory, 'public');
    const s3Directory = join(projectDirectory, 'test-output/us-east-1/test');
    const testDirectory = async (directory: string): Promise<void> => {
        await Promise.all(
            (await readdir(directory)).map(async (name) => {
                const file = join(directory, name);
                const stats = await stat(file);
                if (stats.isDirectory()) {
                    await testDirectory(file);
                } else {
                    t.log(file);
                    const [source, uploaded] = await Promise.all([
                        readFile(file),
                        readFile(join(s3Directory, relative(publicDirectory, file))),
                    ]);
                    t.is(uploaded.length, source.length);
                    switch (extname(name)) {
                    case '.txt':
                    case '.html':
                    case '.css':
                    case '.js':
                        t.is(`${uploaded}`, `${source}`);
                        break;
                    default:
                        t.true(
                            Buffer.isBuffer(uploaded) && Buffer.isBuffer(source) && uploaded.equals(source),
                            `Failed: ${file}`,
                        );
                    }
                }
            }),
        );
    };
    await testDirectory(publicDirectory);
});
