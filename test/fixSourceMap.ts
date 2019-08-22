import {join, extname} from 'path';
import {join as ujoin} from 'upath';
import {readFile, writeFile, readdir} from '../src/fs';

const projectRoot = join(__dirname, '..');
const fixSourceMap = async (): Promise<void> => {
    const libraryPath = join(projectRoot, 'lib');
    await Promise.all(
        (await readdir(libraryPath))
        .filter((name) => extname(name) === '.js')
        .map(async (name) => {
            if (name.endsWith('.test.js')) {
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
