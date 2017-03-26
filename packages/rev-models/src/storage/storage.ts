import { IModelMeta } from '../models/meta';
import { ICreateOptions, IReadOptions, IUpdateOptions, IRemoveOptions } from '../models';
import { InMemoryStorage } from './inmemory';
import { ModelOperationResult } from '../models/operations';
import { IModel } from '../models/model';
import { IWhereQuery } from '../queries/query';
export * from './inmemory';

export interface IStorage {
    create<T extends IModel>(model: T, meta: IModelMeta<T>, result: ModelOperationResult<T>, options: ICreateOptions): Promise<void>;
    update<T extends IModel>(model: T, meta: IModelMeta<T>, where: IWhereQuery, result: ModelOperationResult<T>, options: IUpdateOptions): Promise<void>;
    read<T extends IModel>(model: new() => T, meta: IModelMeta<T>, where: IWhereQuery, result: ModelOperationResult<T>, options: IReadOptions): Promise<void>;
    remove<T extends IModel>(meta: IModelMeta<T>, where: IWhereQuery, result: ModelOperationResult<T>, options: IRemoveOptions): Promise<void>;
}

let configuredStorage: {[storageName: string]: IStorage};

export function get(storageName: string) {
    if (!storageName) {
        throw new Error('StorageError: you must specify the name of the storage to get.');
    }
    if (!(storageName in configuredStorage)) {
        throw new Error(`StorageError: Storage '${storageName}' has has not been configured.`);
    }
    return configuredStorage[storageName];
}

export function configure(storageName: string, storage: IStorage) {
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

export function getAll() {
    return configuredStorage;
}

export function resetStorage() {
    configuredStorage = {
        default: new InMemoryStorage()
    };
}

resetStorage();
