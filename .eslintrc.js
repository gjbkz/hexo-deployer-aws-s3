module.exports = {
    extends: '@nlib/eslint-config',
    env: {
        es6: true,
        node: true,
    },
    rules: {
        '@nlib/no-globals': 'off',
    },
    globals: {
        hexo: true,
    },
};
