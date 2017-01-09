
import { expect } from 'chai';
import { IStorage } from '../storage';
import * as storage from '../index';
import { getAll, resetStorage } from '../storage';
import { InMemoryStorage } from '../inmemory';

describe('rev.storage', () => {

    let fakeStorage: IStorage = <any> {
        create: () => {},
        read: () => {},
        update: () => {},
        remove: () => {}
    };

    beforeEach(() => {
        resetStorage();
    });

    describe('initial state', () => {

        it('has the default storage interface configured', () => {
            let storages = getAll();
            expect(Object.keys(storages)).to.deep.equal(['default']);
        });

        it('default storage is an instance of InMemoryStorage', () => {
            let s = storage.get('default');
            expect(s).to.be.instanceOf(InMemoryStorage);
        });

    });

    describe('configure()', () => {

        it('successfully configures a new valid storage', () => {
            storage.configure('my_db', fakeStorage);
            expect(storage.get('my_db')).to.equal(fakeStorage);
        });

        it('successfully overrides the default storage', () => {
            expect(storage.get('default')).to.be.instanceOf(InMemoryStorage);
            storage.configure('default', fakeStorage);
            expect(storage.get('default')).to.equal(fakeStorage);
        });

        it('throws an error when storageName is not specified', () => {
            expect(() => {
                storage.configure(undefined, undefined);
            }).to.throw('you must specify a name');
        });

        it('throws an error when storage is not an object', () => {
            expect(() => {
                storage.configure('my_storage', <any> (() => {}));
            }).to.throw('you must pass an instance of a storage class');
        });

        it('throws an error when storage is missing one or more methods', () => {
            expect(() => {
                storage.configure('my_storage', <any> {});
            }).to.throw('the specified storage does not fully implement the IStorage interface');
        });

    });

    describe('get()', () => {

        it('gets the default storage', () => {
            expect(storage.get('default')).to.be.instanceOf(InMemoryStorage);
        });

        it('gets a custom storage', () => {
            storage.configure('my_db', fakeStorage);
            expect(storage.get('my_db')).to.equal(fakeStorage);
        });

        it('throws an error if storageName not specified', () => {
            expect(() => {
                storage.get(undefined);
            }).to.throw('you must specify the name of the storage to get');
        });

        it('throws an error if storageName has not been configured', () => {
            expect(() => {
                storage.get('non-configured-storage');
            }).to.throw('has has not been configured');
        });

    });

});
