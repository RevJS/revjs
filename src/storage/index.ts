import { IModelMeta } from '../model/meta';
import { ICreateOptions, IReadOptions, IUpdateOptions, IRemoveOptions } from '../model';
import { InMemoryStorage } from './inmemory';
export * from './inmemory';

export interface IStorage {
    create<T>(model: T, meta: IModelMeta<T>, options?: ICreateOptions): Promise<T>;
    update<T>(model: T, meta: IModelMeta<T>, where?: any, options?: IUpdateOptions): Promise<boolean>;
    read<T>(model: new() => T, meta: IModelMeta<T>, where?: any, options?: IReadOptions): Promise<T[]>;
    remove<T>(model: new() => T, meta: IModelMeta<T>, where?: any, options?: IRemoveOptions): Promise<boolean>;
}

let configuredStorage: {[storageName: string]: IStorage} = {
    default: new InMemoryStorage()
};

export function get(storageName: string) {
    return configuredStorage[storageName];
}

export function configure(storageName: string, storage: IStorage) {
    configuredStorage[storageName] = storage;
}
