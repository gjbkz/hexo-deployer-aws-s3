import * as path from 'path';
import * as fs from 'fs';

export type MakeDirectoryOptions = number | string | fs.MakeDirectoryOptions | null;

export const stat = async (
    filePath: fs.PathLike,
): Promise<fs.Stats> => {
    const stats = await new Promise<fs.Stats>((resolve, reject) => {
        fs.stat(filePath, (error, stats) => error ? reject(error) : resolve(stats));
    });
    return stats;
};

export const mkdtemp = async (
    prefix: string,
): Promise<string> => {
    const createdDirectory = await new Promise<string>((resolve, reject) => {
        fs.mkdtemp(prefix, (error, created) => error ? reject(error) : resolve(created));
    });
    return createdDirectory;
};

export const writeFile = async (
    directoryPath: fs.PathLike,
    data: Parameters<typeof fs.writeFile>[1],
    options?: fs.WriteFileOptions,
): Promise<void> => {
    await new Promise((resolve, reject) => {
        const callback = (error: NodeJS.ErrnoException | null) => error ? reject(error) : resolve();
        if (options) {
            fs.writeFile(directoryPath, data, options, callback);
        } else {
            fs.writeFile(directoryPath, data, callback);
        }
    });
};

export const readFile = async (
    directoryPath: fs.PathLike,
    options?: {encoding?: string | null, flag?: string} | string | null,
): Promise<string | Buffer> => {
    const result = await new Promise<string | Buffer>((resolve, reject) => {
        fs.readFile(directoryPath, options, (error, data) => error ? reject(error) : resolve(data));
    });
    return result;
};

export const readdir = async (
    directoryPath: fs.PathLike,
): Promise<Array<string>> => {
    const result = await new Promise<Array<string>>((resolve, reject) => {
        fs.readdir(directoryPath, (error, names) => error ? reject(error) : resolve(names));
    });
    return result;
};

export const mkdir = async (
    directoryPath: fs.PathLike,
    options?: MakeDirectoryOptions,
): Promise<void> => {
    try {
        await new Promise<void>((resolve, reject) => {
            fs.mkdir(directoryPath, options, (error) => error ? reject(error) : resolve());
        });
    } catch (error) {
        if (error.code === 'EEXIST') {
            const stats = await stat(directoryPath);
            if (stats.isDirectory()) {
                return;
            }
        }
        throw error;
    }
};

export const mkdirp = async (
    directoryPath: string,
    options?: MakeDirectoryOptions,
): Promise<void> => {
    try {
        await mkdir(directoryPath, options);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await mkdirp(path.dirname(directoryPath));
            await mkdir(directoryPath);
            return;
        }
        throw error;
    }
};
