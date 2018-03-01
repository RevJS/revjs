
// TypeDoc Configuration
module.exports = {
    out: '../../docs/dist/api/rev-models',

    readme: 'none',
    includes: '../',
    exclude: '**/{__tests__,__test_utils__,testsuite}/**/*',
    theme: '../../docs/typedoc/theme/',
    
    mode: 'file',
    excludeExternals: true,
    excludeNotExported: true,
    excludePrivate: true
};
