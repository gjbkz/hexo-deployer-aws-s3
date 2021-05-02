import {join, extname} from 'path';
import {join as ujoin} from 'upath';
import {promises as afs} from 'fs';
import * as console from 'console';

const projectRoot = join(__dirname, '..');
const fixSourceMap = async (): Promise<void> => {
    const libraryPath = join(projectRoot, 'lib');
    for (const name of await afs.readdir(libraryPath)) {
        if (extname(name) === '.js') {
            if (name.endsWith('.test.js')) {
                return;
            }
            const scriptPath = join(libraryPath, name);
            const script = await afs.readFile(scriptPath, 'utf8');
            const updated = script.replace(
                /\/\/#\s+sourceMappingURL=(\S*)/g,
                (_, url) => `\n//# sourceMappingURL=${ujoin('lib', url)}`);
            await afs.writeFile(scriptPath, updated);
        }
    }
};

if (require.main === module) {
    fixSourceMap().catch((error) => {
        console.error(`${error}`);
        process.exit(1);
    });
}
