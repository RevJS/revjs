
import { expect } from 'chai';

import * as Hapi from 'hapi';
import { createServer, createApiRegistry } from '../test-utils';
import { ModelApiRegistry } from 'rev-api';
import { IModelApiPluginOptions, ModelApiPlugin, pluginVersion } from '../plugin/plugin';

let pkgJson = require('../../package.json');

describe('RevApiPlugin - registration', () => {

    let server: Hapi.Server;
    let apiRegistry: ModelApiRegistry;
    let testOptions: IModelApiPluginOptions;

    before(() => {
        apiRegistry = createApiRegistry();
        testOptions = {
            registry: apiRegistry
        };
        return createServer({
            addPlugins: {
                register: ModelApiPlugin,
                options: testOptions
            }
        }).then((res) => {
            server = res;
        });
    });

    it('is added to Hapi.Server as a plugin', () => {
        expect(server.plugins).to.have.key('revApi');
    });

    it('exposes the rev-api plugin package version number', () => {
        expect(server.plugins['revApi']).to.contain({
            version: pkgJson.version
        });
    });

    it('exposes an instance of the RevApi object', () => {
        expect(server.plugins['revApi']).to.have.property('version');
        expect(server.plugins['revApi'].version).to.equal(pluginVersion);
    });

});
