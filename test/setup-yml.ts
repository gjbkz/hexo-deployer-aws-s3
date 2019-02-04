import {safeLoad, safeDump} from 'js-yaml';
import {join} from 'path';
import {readFile, writeFile} from 'fs';

const setupYML = async () => {
    const ymlFilePath = join(__dirname, 'project/_config.yml');
    const yml = await new Promise<string>((resolve, reject) => {
        readFile(ymlFilePath, 'utf8', (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
    const config = safeLoad(yml);
    config.deploy = {
        type: 'aws-s3',
        region: 'us-east-1',
        bucket: 'test',
    };
    const updated = safeDump(config);
    await new Promise<string>((resolve, reject) => {
        writeFile(ymlFilePath, updated, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

if (!module.parent) {
    setupYML()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
