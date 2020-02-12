import {safeLoad, safeDump} from 'js-yaml';
import * as path from 'path';
import {promises as afs} from 'fs';
import {readFile, writeFile} from '../src/fs';

const projectDirectory = path.join(__dirname, 'project');

const copyFiles = async (): Promise<void> => {
    const imagesDirectory = path.join(__dirname, 'images');
    const files = await afs.readdir(imagesDirectory);
    const destDirectory = path.join(projectDirectory, 'source/images');
    await afs.mkdir(destDirectory, {recursive: true});
    await Promise.all(files.map(async (name) => {
        const source = path.join(imagesDirectory, name);
        const dest = path.join(destDirectory, name);
        await afs.copyFile(source, dest);
    }));
};

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

const installPackage = async (): Promise<void> => {
    await afs.symlink(
        path.join(__dirname, '..'),
        path.join(projectDirectory, 'node_modules', 'hexo-deployer-aws-s3'),
    );
};

const setup = async (): Promise<void> => {
    await afs.mkdir(projectDirectory, {recursive: true});
    await copyFiles();
    await setupYML();
    await setupJSON();
    await installPackage();
};

if (!module.parent) {
    setup()
    .catch((error) => {
        process.stderr.write(`${error.stack || error}`);
        process.exit(1);
    });
}
