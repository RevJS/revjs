"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var inmemory_1 = require("./inmemory");
__export(require("./inmemory"));
var configuredStorage;
function get(storageName) {
    if (!storageName) {
        throw new Error('StorageError: you must specify the name of the storage to get.');
    }
    if (!(storageName in configuredStorage)) {
        throw new Error("StorageError: Storage '" + storageName + "' has has not been configured.");
    }
    return configuredStorage[storageName];
}
exports.get = get;
function configure(storageName, storage) {
    if (!storageName) {
        throw new Error('StorageError: you must specify a name for the storage to configure.');
    }
    if (!storage || typeof storage != 'object') {
        throw new Error('StorageError: you must pass an instance of a storage class to storage.configure().');
    }
    if (typeof storage.create != 'function' || typeof storage.update != 'function'
        || typeof storage.read != 'function' || typeof storage.remove != 'function') {
        throw new Error('StorageError: the specified storage does not fully implement the IStorage interface.');
    }
    configuredStorage[storageName] = storage;
}
exports.configure = configure;
function getAll() {
    return configuredStorage;
}
exports.getAll = getAll;
function resetStorage() {
    configuredStorage = {
        default: new inmemory_1.InMemoryStorage()
    };
}
exports.resetStorage = resetStorage;
resetStorage();
