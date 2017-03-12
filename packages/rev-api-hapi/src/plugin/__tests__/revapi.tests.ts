
import { expect } from 'chai';

// import * as Hapi from 'hapi';
import * as sinon from 'sinon';
import { ModelApiRegistry, registry as revApiRegistry } from 'rev-api/lib/registry';
import { IRevApiOptions, RevApi, URL_MATCH_PATTERN } from '../revapi';

describe('RevApi', () => {

    let routeSpy = sinon.spy();
    let server: any = {
        route: routeSpy
    };
    let apiRegistry = new ModelApiRegistry();
    let testOptions: IRevApiOptions;

    beforeEach(() => {
        routeSpy.reset();
        testOptions = {
            apiRegistry: apiRegistry
        };
    });

    describe('constructor()', () => {

        it('creates a default /api route using the shared rev-api registry', () => {
            let api = new RevApi(server);
            let route = routeSpy.getCall(0).args[0];
            expect(api).to.be.instanceOf(RevApi);
            expect(api.baseUrl).to.equal('/api/');
            expect(api.apiRegistry).to.equal(revApiRegistry);
            expect(route).to.have.keys('method', 'path', 'handler');
            expect(route.method).to.deep.equal(['GET', 'POST', 'PUT', 'DELETE']);
            expect(route.path).to.equal('/api/' + URL_MATCH_PATTERN);
        });

        it('uses the baseUrl passed in options if present', () => {
            let api = new RevApi(server, {
                baseUrl: '/custom_url/'
            });
            let route = routeSpy.getCall(0).args[0];
            expect(api.baseUrl).to.equal('/custom_url/');
            expect(route).to.have.keys('method', 'path', 'handler');
            expect(route.path).to.equal('/custom_url/' + URL_MATCH_PATTERN);
        });

        it('adds a trailing slash to the baseUrl if not present', () => {
            let api = new RevApi(server, {
                baseUrl: '/custom_url'
            });
            let route = routeSpy.getCall(0).args[0];
            expect(api.baseUrl).to.equal('/custom_url/');
            expect(route).to.have.keys('method', 'path', 'handler');
            expect(route.path).to.equal('/custom_url/' + URL_MATCH_PATTERN);
        });

        it('uses the apiRegistry passed in options if present', () => {
            let api = new RevApi(server, {
                apiRegistry: apiRegistry
            });
            expect(api.apiRegistry).to.equal(apiRegistry);
        });

        it('uses the default values if passed options are invalid', () => {
            let api = new RevApi(server, {
                baseUrl: { url: '/flibble'},
                apiRegistry: 'george'
            } as any);
            let route = routeSpy.getCall(0).args[0];
            expect(route).to.have.keys('method', 'path', 'handler');
            expect(route.path).to.equal('/api/' + URL_MATCH_PATTERN);
            expect(api.apiRegistry).to.equal(revApiRegistry);
        });

    });

});
