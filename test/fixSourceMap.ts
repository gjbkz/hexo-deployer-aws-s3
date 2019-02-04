import {join, extname} from 'path';
import {join as ujoin} from 'upath';
import {
    readdir as $readdir,
    readFile as $readFile,
    writeFile as $writeFile,
} from 'fs';

const projectRoot = join(__dirname, '..');

const readdir = (directory: string): Promise<Array<string>> => new Promise((resolve, reject) => {
    $readdir(directory, (error, files) => {
        if (error) {
            reject(error);
        } else {
            resolve(files);
        }
    });
});

const readFile = (file: string, encoding?: string): Promise<string | Buffer> => new Promise((resolve, reject) => {
    $readFile(file, encoding, (error, data) => {
        if (error) {
            reject(error);
        } else {
            resolve(data);
        }
    });
});

const writeFile = (file: string, body: string | Buffer): Promise<void> => new Promise((resolve, reject) => {
    $writeFile(file, body, (error) => {
        if (error) {
            reject(error);
        } else {
            resolve();
        }
    });
});

const fixSourceMap = async (): Promise<void> => {
    const libraryPath = join(projectRoot, 'lib');
    await Promise.all(
        (await readdir(libraryPath))
        .filter((name) => extname(name) === '.js')
        .map(async (name) => {
            if ((/\.test\.js$/).test(name)) {
                return;
            }
            const scriptPath = join(libraryPath, name);
            const script = `${await readFile(scriptPath, 'utf8')}`;
            const updated = script.replace(/\/\/#\s+sourceMappingURL=(\S*)/g, (_, url) => {
                return `\n//# sourceMappingURL=${ujoin('lib', url)}\n`;
            });
            await writeFile(scriptPath, updated);
        }),
    );
};

if (!module.parent) {
    fixSourceMap()
    .catch((error) => {
        process.stderr.write(`${error.stack || error}`);
        process.exit(1);
    });
}
