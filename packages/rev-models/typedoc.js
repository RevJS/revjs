
// TypeDoc Configuration
module.exports = {
    out: './lib/docs',

    readme: './src/docs/INDEX.md',
    includes: './src',
    theme: '../../docs/theme/',
    
    mode: 'file',
    excludeExternals: true,
    excludeNotExported: true,
    excludePrivate: true
};
