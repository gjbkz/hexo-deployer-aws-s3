import * as path from 'path';
import * as fs from 'fs';

export type MakeDirectoryOptions = number | string | fs.MakeDirectoryOptions | null;

export const stat = (
    filePath: fs.PathLike,
): Promise<fs.Stats> => new Promise((resolve, reject) => {
    fs.stat(filePath, (error, stats) => error ? reject(error) : resolve(stats));
});

export const mkdtemp = (
    prefix: string,
): Promise<string> => new Promise((resolve, reject) => {
    fs.mkdtemp(prefix, (error, created) => error ? reject(error) : resolve(created));
});

export const writeFile = (
    directoryPath: fs.PathLike,
    data: Parameters<typeof fs.writeFile>[1],
    options?: fs.WriteFileOptions,
): Promise<void> => new Promise((resolve, reject) => {
    const callback = (error: NodeJS.ErrnoException | null) => error ? reject(error) : resolve();
    if (options) {
        fs.writeFile(directoryPath, data, options, callback);
    } else {
        fs.writeFile(directoryPath, data, callback);
    }
});

export const readFile = (
    directoryPath: fs.PathLike,
    options?: {encoding?: string | null, flag?: string} | string | null,
): Promise<string | Buffer> => new Promise((resolve, reject) => {
    fs.readFile(directoryPath, options, (error, data) => error ? reject(error) : resolve(data));
});

export const readdir = (
    directoryPath: fs.PathLike,
): Promise<Array<string>> => new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (error, names) => error ? reject(error) : resolve(names));
});

export const mkdir = (
    directoryPath: fs.PathLike,
    options?: MakeDirectoryOptions,
): Promise<void> => new Promise<void>((resolve, reject) => {
    fs.mkdir(directoryPath, options, (error) => error ? reject(error) : resolve());
})
.catch(async (error) => {
    if (error.code === 'EEXIST') {
        const stats = await stat(directoryPath);
        if (stats.isDirectory()) {
            return;
        }
    }
    throw error;
});

export const mkdirp = (
    directoryPath: string,
    options?: MakeDirectoryOptions,
): Promise<void> => mkdir(directoryPath, options)
.catch((error) => {
    if (error.code === 'ENOENT') {
        return mkdirp(path.dirname(directoryPath)).then(() => mkdir(directoryPath));
    }
    throw error;
});
