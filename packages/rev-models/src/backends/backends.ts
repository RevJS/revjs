import { IModelMeta } from '../models/meta';
import { ICreateOptions, IReadOptions, IUpdateOptions, IRemoveOptions } from '../models';
import { InMemoryBackend } from './inmemory';
import { ModelOperationResult } from '../models/operations';
import { IModel } from '../models/model';
import { IWhereQuery } from '../queries/query';
export * from './inmemory';

export interface IBackend {
    create<T extends IModel>(model: T, meta: IModelMeta<T>, result: ModelOperationResult<T>, options: ICreateOptions): Promise<void>;
    update<T extends IModel>(model: T, meta: IModelMeta<T>, where: IWhereQuery, result: ModelOperationResult<T>, options: IUpdateOptions): Promise<void>;
    read<T extends IModel>(model: new() => T, meta: IModelMeta<T>, where: IWhereQuery, result: ModelOperationResult<T>, options: IReadOptions): Promise<void>;
    remove<T extends IModel>(meta: IModelMeta<T>, where: IWhereQuery, result: ModelOperationResult<T>, options: IRemoveOptions): Promise<void>;
}

let configuredBackends: {[backendName: string]: IBackend};

export function get(backendName: string): IBackend {
    if (!backendName) {
        throw new Error('BackendError: you must specify the name of the backend to get.');
    }
    if (!(backendName in configuredBackends)) {
        throw new Error(`BackendError: Backend '${backendName}' has has not been configured.`);
    }
    return configuredBackends[backendName];
}

export function configure(backendName: string, backend: IBackend) {
    if (!backendName) {
        throw new Error('BackendError: you must specify a name for the backend to configure.');
    }
    if (!backend || typeof backend != 'object') {
        throw new Error('BackendError: you must pass an instance of a backend class to backends.configure().');
    }
    if (typeof backend.create != 'function' || typeof backend.update != 'function'
        || typeof backend.read != 'function' || typeof backend.remove != 'function') {
        throw new Error('BackendError: the specified backend does not fully implement the IBackend interface.');
    }
    configuredBackends[backendName] = backend;
}

export function getAll(): {[backendName: string]: IBackend} {
    return configuredBackends;
}

export function resetBackends(): void {
    configuredBackends = {
        default: new InMemoryBackend()
    };
}

resetBackends();
