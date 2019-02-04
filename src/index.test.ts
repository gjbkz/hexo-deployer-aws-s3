import test from 'ava';
import {join, relative, extname} from 'path';
import {
    readdir as $readdir,
    readFile as $readFile,
    stat as $stat,
    Stats,
} from 'fs';
import {exec as $exec, ExecOptions} from 'child_process';

const projectRoot = join(__dirname, '..');
const projectDirectory = join(projectRoot, 'test/project');

interface IExecResult {
    stdout: string,
    stderr: string,
}

const exec = (command: string, options: ExecOptions): Promise<IExecResult> => new Promise<IExecResult>((resolve, reject) => {
    $exec(command, options, (error, stdout, stderr) => {
        if (error) {
            reject(error);
        } else {
            resolve({stdout, stderr});
        }
    });
});

test.before(async (t) => {
    await exec('npm run generate', {cwd: projectDirectory});
    const {stdout, stderr} = await exec('npm run deploy', {cwd: projectDirectory});
    t.log(stdout);
    t.log(stderr);
});

const readFile = (file: string): Promise<Buffer> => new Promise((resolve, reject) => {
    $readFile(file, (error, buffer) => {
        if (error) {
            reject(error);
        } else {
            resolve(buffer);
        }
    });
});

const readdir = (directory: string): Promise<Array<string>> => new Promise((resolve, reject) => {
    $readdir(directory, (error, files) => {
        if (error) {
            reject(error);
        } else {
            resolve(files);
        }
    });
});

const stat = (file: string): Promise<Stats> => new Promise((resolve, reject) => {
    $stat(file, (error, stats: Stats) => {
        if (error) {
            reject(error);
        } else {
            resolve(stats);
        }
    });
});

test('compare files', async (t) => {
    const publicDirectory = join(projectDirectory, 'public');
    const s3Directory = join(projectDirectory, 'test-output/us-east-1/test');
    const testDirectory = async (directory: string): Promise<void> => {
        await Promise.all(
            (await readdir(directory))
            .map(async (name) => {
                const file = join(directory, name);
                const stats = await stat(file);
                if (stats.isDirectory()) {
                    await testDirectory(file);
                } else {
                    t.log(file);
                    const [source, uploaded] = await Promise.all([
                        await readFile(file),
                        await readFile(join(s3Directory, relative(publicDirectory, file))),
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
                        t.true(uploaded.equals(source), `Failed: ${file}`);
                    }
                }
            })
        );
    };
    await testDirectory(publicDirectory);
});
