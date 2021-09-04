export default {
    timeout: '1m',
    extensions: ['ts', 'js'],
    require: ['ts-node/register'],
    files: [
        'test/test.ts',
    ],
};
