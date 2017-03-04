"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var storage = require("../index");
var storage_1 = require("../storage");
var inmemory_1 = require("../inmemory");
describe('rev.storage', function () {
    var fakeStorage = {
        create: function () { },
        read: function () { },
        update: function () { },
        remove: function () { }
    };
    beforeEach(function () {
        storage_1.resetStorage();
    });
    describe('initial state', function () {
        it('has the default storage interface configured', function () {
            var storages = storage_1.getAll();
            chai_1.expect(Object.keys(storages)).to.deep.equal(['default']);
        });
        it('default storage is an instance of InMemoryStorage', function () {
            var s = storage.get('default');
            chai_1.expect(s).to.be.instanceOf(inmemory_1.InMemoryStorage);
        });
    });
    describe('configure()', function () {
        it('successfully configures a new valid storage', function () {
            storage.configure('my_db', fakeStorage);
            chai_1.expect(storage.get('my_db')).to.equal(fakeStorage);
        });
        it('successfully overrides the default storage', function () {
            chai_1.expect(storage.get('default')).to.be.instanceOf(inmemory_1.InMemoryStorage);
            storage.configure('default', fakeStorage);
            chai_1.expect(storage.get('default')).to.equal(fakeStorage);
        });
        it('throws an error when storageName is not specified', function () {
            chai_1.expect(function () {
                storage.configure(undefined, undefined);
            }).to.throw('you must specify a name');
        });
        it('throws an error when storage is not an object', function () {
            chai_1.expect(function () {
                storage.configure('my_storage', (function () { }));
            }).to.throw('you must pass an instance of a storage class');
        });
        it('throws an error when storage is missing one or more methods', function () {
            chai_1.expect(function () {
                storage.configure('my_storage', {});
            }).to.throw('the specified storage does not fully implement the IStorage interface');
        });
    });
    describe('get()', function () {
        it('gets the default storage', function () {
            chai_1.expect(storage.get('default')).to.be.instanceOf(inmemory_1.InMemoryStorage);
        });
        it('gets a custom storage', function () {
            storage.configure('my_db', fakeStorage);
            chai_1.expect(storage.get('my_db')).to.equal(fakeStorage);
        });
        it('throws an error if storageName not specified', function () {
            chai_1.expect(function () {
                storage.get(undefined);
            }).to.throw('you must specify the name of the storage to get');
        });
        it('throws an error if storageName has not been configured', function () {
            chai_1.expect(function () {
                storage.get('non-configured-storage');
            }).to.throw('has has not been configured');
        });
    });
});
