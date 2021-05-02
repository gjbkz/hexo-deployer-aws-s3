import * as yaml from 'js-yaml';
import * as path from 'path';
import {promises as afs} from 'fs';
import * as console from 'console';

const isRecordLike = (input: unknown): input is Record<string, unknown> => typeof input === 'object' && input !== null;
const projectDirectory = path.join(__dirname, 'project');

const copyFiles = async (): Promise<void> => {
    const imagesDirectory = path.join(__dirname, 'images');
    const destDirectory = path.join(projectDirectory, 'source/images');
    await afs.mkdir(destDirectory, {recursive: true});
    for (const name of await afs.readdir(imagesDirectory)) {
        const source = path.join(imagesDirectory, name);
        const dest = path.join(destDirectory, name);
        await afs.copyFile(source, dest);
    }
};

const setupYML = async (): Promise<void> => {
    const ymlFilePath = path.join(projectDirectory, '_config.yml');
    const yml = await afs.readFile(ymlFilePath, 'utf8');
    const config = yaml.load(yml);
    if (!isRecordLike(config)) {
        throw new Error('Invalid config');
    }
    config.deploy = {
        type: 'aws-s3',
        region: 'us-east-1',
        bucket: 'test',
    };
    await afs.writeFile(ymlFilePath, yaml.dump(config));
};

const setupJSON = async (): Promise<void> => {
    const jsonFilePath = path.join(projectDirectory, 'package.json');
    const json = await afs.readFile(jsonFilePath, 'utf8');
    const config = JSON.parse(json) as unknown;
    if (!isRecordLike(config)) {
        throw new Error('Invalid config');
    }
    config.scripts = {
        generate: 'hexo generate',
        deploy: 'hexo deploy --test test-output',
    };
    const {dependencies = {}} = config;
    if (!isRecordLike(dependencies)) {
        throw new Error('Invalid dependencies');
    }
    dependencies['hexo-deployer-aws-s3'] = 'file:../..';
    config.dependencies = dependencies;
    await afs.writeFile(jsonFilePath, JSON.stringify(config, null, 4));
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

if (require.main === module) {
    setup().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
