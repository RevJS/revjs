import { IModel, ICreateOptions, IReadOptions, IUpdateOptions, IRemoveOptions } from '../model';
import InMemoryStorage from './inmemory';

export interface IStorage {
    create<T extends IModel>(model: T, options?: ICreateOptions): Promise<T>;
    update<T extends IModel>(model: T, where?: any, options?: IUpdateOptions): Promise<boolean>;
    read<T extends IModel>(model: T, where?: any, options?: IReadOptions): Promise<Array<T>>;
    remove<T extends IModel>(model: T, where?: any, options?: IRemoveOptions): Promise<boolean>;
}

let configuredStorage: {[storageName: string]: IStorage} = {
    default: new InMemoryStorage()
};

export function getStorage(storageName: string) {
    return configuredStorage[storageName];
}

export default function configureStorage(storageName: string, storage: IStorage) {
    configuredStorage[storageName] = storage;
}
