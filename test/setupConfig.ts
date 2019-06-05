import {safeLoad, safeDump} from 'js-yaml';
import {join} from 'path';
import {readFile, writeFile} from '../src/fs';

const projectDirectory = join(__dirname, 'project');

const setupYML = async (): Promise<void> => {
    const ymlFilePath = join(projectDirectory, '_config.yml');
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
    const jsonFilePath = join(projectDirectory, 'package.json');
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

if (!module.parent) {
    Promise.all([
        setupYML(),
        setupJSON(),
    ])
    .catch((error) => {
        process.stderr.write(`${error.stack || error}`);
        process.exit(1);
    });
}
