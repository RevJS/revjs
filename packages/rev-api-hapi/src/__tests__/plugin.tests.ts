
import { expect } from 'chai';

import * as Hapi from 'hapi';
import { createServer, createApiRegistry } from '../test-utils';
import RevApiPlugin from '../index';
import { IRevApiPluginOptions } from '../index';
import { ModelApiRegistry } from 'rev-api/registry';

let pkgJson = require('../../package.json');

describe('RevApiPlugin - registration', () => {

    let server: Hapi.Server;
    let apiRegistry: ModelApiRegistry;
    let testOptions: IRevApiPluginOptions;

    beforeEach(() => {
        apiRegistry = createApiRegistry();
        testOptions = {
            apiRegistry: apiRegistry
        };
        return createServer({
            addPlugins: {
                register: RevApiPlugin,
                options: testOptions
            }
        }).then((res) => {
            server = res;
        });
    });

    it('is added to Hapi.Server as a plugin', () => {
        expect(server.plugins).to.have.key('rev-api');
    });

    it('exposes the rev-api plugin package version number', () => {
        expect(server.plugins['rev-api']).to.have.key('version');
        expect(server.plugins['rev-api'].version).to.equal(pkgJson.version);
    });

});
