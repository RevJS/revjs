
// Base TypeDoc Configuration
module.exports = (moduleName) => ({
    out: '../../docs/dist/api/' + moduleName,

    readme: 'none',
    includes: '../',
    exclude: [
        '**/__tests__/**/*',
        '**/__test_utils__/**/*',
        '**/__fixtures__/**/*',
        '**/testsuite/**/*'
    ],
    theme: '../../docs/typedoc/theme/',

    gaID: 'UA-115939002-1',
    gaSite: 'revjs.org',
    
    mode: 'file',
    excludeExternals: true,
    excludeNotExported: true,
    excludePrivate: true
});
