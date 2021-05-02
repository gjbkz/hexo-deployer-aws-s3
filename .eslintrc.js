module.exports = {
    extends: '@nlib/eslint-config',
    env: {
        es6: true,
        node: true,
    },
    rules: {
        '@nlib/no-globals': 'off',
    },
    overrides: [
        {
            files: [
                'test/**/*.ts',
            ],
            parserOptions: {
                project: 'test/tsconfig.json',
            },
        },
        {
            files: [
                '*.test.ts',
            ],
            rules: {
                '@typescript-eslint/no-unnecessary-condition': 'off',
            },
        },
        {
            files: [
                'src/index.ts',
            ],
            globals: {
                hexo: true,
            },
            rules: {
                'no-invalid-this': 'off',
                '@typescript-eslint/no-floating-promises': 'off',
            },
        },
    ],
};
