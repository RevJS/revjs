
// TypeDoc Configuration
module.exports = {
    out: '../../docs/dist/api/rev-models',

    readme: './DOCINDEX.md',
    includes: './src',
    exclude: '**/{__tests__,examples}/**/*',
    theme: '../../docs/typedoc/theme/',
    
    mode: 'file',
    excludeExternals: true,
    excludeNotExported: true,
    excludePrivate: true
};
