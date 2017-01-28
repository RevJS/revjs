/*
 * Simple script to sync dependency source code from another local folder
 * for use during development. Avoids issues with webpack + npm link.
 * 
 * Requires other RevJS modules to be at the same level as this one
 */

var path = require('path');
var fs = require('fs-extra');

var depPath = path.resolve(__dirname, '..', '..');
var modulesPath = path.resolve(__dirname, '..', 'node_modules');

function syncDependency(depName) {
    console.log('Synching', depName);
    fs.removeSync(
        path.join(modulesPath, depName)
    );
    fs.copySync(
        path.join(depPath, depName, 'dist'),
        path.join(modulesPath, depName)
    );
    fs.copySync(
        path.join(depPath, depName, 'package.json'),
        path.join(modulesPath, depName, 'package.json')
    );
}

syncDependency('rev-models');
