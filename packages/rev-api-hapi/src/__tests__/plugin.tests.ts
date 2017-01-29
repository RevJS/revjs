
import { expect } from 'chai';

import * as Hapi from 'hapi';
import { createServer, createApiRegistry } from '../test-utils';
import RevApiPlugin from '../index';
import { IRevApiOptions, RevApi } from '../api/revapi';
import { ModelApiRegistry } from 'rev-api/registry';

let pkgJson = require('../../package.json');

describe('RevApiPlugin - registration', () => {

    let server: Hapi.Server;
    let apiRegistry: ModelApiRegistry;
    let testOptions: IRevApiOptions;

    before(() => {
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
        expect(server.plugins).to.have.key('revApi');
    });

    it('exposes the rev-api plugin package version number', () => {
        expect(server.plugins['revApi']).to.contain({
            version: pkgJson.version
        });
    });

    it('exposes an instance of the RevApi object', () => {
        expect(server.plugins['revApi']).to.have.property('api');
        expect(server.plugins['revApi'].api).to.be.instanceof(RevApi);
    });

});
