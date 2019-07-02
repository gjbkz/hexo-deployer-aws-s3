import {safeLoad, safeDump} from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';
import {readFile, writeFile} from '../src/fs';

const projectDirectory = path.join(__dirname, 'project');

const setupYML = async (): Promise<void> => {
    const ymlFilePath = path.join(projectDirectory, '_config.yml');
    const yml = `${await readFile(ymlFilePath)}`;
    const config = safeLoad(yml);
    config.deploy = {
        type: 'aws-s3',
        region: 'us-east-1',
        bucket: 'test',
    };
    const updated = safeDump(config);
    await writeFile(ymlFilePath, updated);
};

const setupJSON = async (): Promise<void> => {
    const jsonFilePath = path.join(projectDirectory, 'package.json');
    const json = `${await readFile(jsonFilePath)}`;
    const config = JSON.parse(json);
    config.scripts = {
        generate: 'hexo generate',
        deploy: 'hexo deploy --test test-output',
    };
    config.dependencies['hexo-deployer-aws-s3'] = 'file:../..';
    const updated = JSON.stringify(config, null, 4);
    await writeFile(jsonFilePath, updated);
};

const installPackage = (): Promise<void> => new Promise((resolve, reject) => {
    fs.symlink(
        path.join(__dirname, '..'),
        path.join(projectDirectory, 'node_modules', 'hexo-deployer-aws-s3'),
        (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        },
    );
});

if (!module.parent) {
    Promise.all([
        setupYML(),
        setupJSON(),
    ])
    .then(installPackage)
    .catch((error) => {
        process.stderr.write(`${error.stack || error}`);
        process.exit(1);
    });
}
