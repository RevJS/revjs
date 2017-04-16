
import { expect } from 'chai';
import { IBackend } from '../backends';
import * as backends from '../index';
import { getAll, resetBackends } from '../backends';
import { InMemoryBackend } from '../inmemory/backend';

describe('rev.backend', () => {

    let fakebackend: IBackend = {
        create: () => {},
        read: () => {},
        update: () => {},
        remove: () => {}
    } as any;

    beforeEach(() => {
        resetBackends();
    });

    describe('initial state', () => {

        it('has the default backend interface configured', () => {
            let backendList = getAll();
            expect(Object.keys(backendList)).to.deep.equal(['default']);
        });

        it('default backend is an instance of InMemoryBackend', () => {
            let s = backends.get('default');
            expect(s).to.be.instanceOf(InMemoryBackend);
        });

    });

    describe('configure()', () => {

        it('successfully configures a new valid backend', () => {
            backends.configure('my_db', fakebackend);
            expect(backends.get('my_db')).to.equal(fakebackend);
        });

        it('successfully overrides the default backend', () => {
            expect(backends.get('default')).to.be.instanceOf(InMemoryBackend);
            backends.configure('default', fakebackend);
            expect(backends.get('default')).to.equal(fakebackend);
        });

        it('throws an error when backendName is not specified', () => {
            expect(() => {
                backends.configure(undefined, undefined);
            }).to.throw('you must specify a name');
        });

        it('throws an error when backend is not an object', () => {
            expect(() => {
                backends.configure('my_backend', (() => {}) as any);
            }).to.throw('you must pass an instance of a backend class');
        });

        it('throws an error when backend is missing one or more methods', () => {
            expect(() => {
                backends.configure('my_backend', {} as any);
            }).to.throw('the specified backend does not fully implement the IBackend interface');
        });

    });

    describe('get()', () => {

        it('gets the default backend', () => {
            expect(backends.get('default')).to.be.instanceOf(InMemoryBackend);
        });

        it('gets a custom backend', () => {
            backends.configure('my_db', fakebackend);
            expect(backends.get('my_db')).to.equal(fakebackend);
        });

        it('throws an error if backendName not specified', () => {
            expect(() => {
                backends.get(undefined);
            }).to.throw('you must specify the name of the backend to get');
        });

        it('throws an error if backendName has not been configured', () => {
            expect(() => {
                backends.get('non-configured-backend');
            }).to.throw('has has not been configured');
        });

    });

});
