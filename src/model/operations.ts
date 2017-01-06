import { IModel } from './index';
import { checkIsModelInstance, checkIsModelConstructor } from './utils';
import { IValidationOptions, validateAgainstMeta } from './validation';
import { registry } from '../registry';
import * as storage from '../storage';

export type ModelOperation = 'create' | 'update' | 'remove';

export interface ICreateOptions {
    validation?: IValidationOptions;
}

export interface IReadOptions {
    offset?: number;
    limit?: number;
    fields?: string[];
}

export interface IUpdateOptions {
    validation?: IValidationOptions;
}

export interface IRemoveOptions {
    limit?: number;
}

export function create<T extends IModel>(model: T, options?: ICreateOptions): Promise<T> {

    checkIsModelInstance(model);
    let meta = registry.getMeta(model.constructor.name);
    if (meta.singleton) {
        throw new Error('create() cannot be called on singleton models');
    }

    validateAgainstMeta(model, meta, 'create', options ? options.validation : null);

    let store = storage.get(meta.storage);
    if (!storage) {
        throw new Error('create() error - model storage \'${vals.__meta__.storage}\' is not configured');
    }
    return store.create<typeof model>(model, meta,  options);
}

export function update<T extends IModel>(model: T, where?: any, options?: IUpdateOptions): Promise<boolean> {
    checkIsModelInstance(model);
    let meta = registry.getMeta(model.constructor.name);

    // TODO: Get existing vals when appropriate

    validateAgainstMeta(model, meta, 'update', options ? options.validation : null);

    let store = storage.get(meta.storage);
    if (!storage) {
        throw new Error('update() error - model storage \'${vals.__meta__.storage}\' is not configured');
    }
    return store.update(model, meta, where, options);
}

export function read<T extends IModel>(model: new() => T, where?: any, options?: IReadOptions): Promise<T[]> {
    checkIsModelConstructor(model);
    let meta = registry.getMeta(model.name);

    let store = storage.get(meta.storage);
    if (!storage) {
        throw new Error('read() error - model storage \'${vals.__meta__.storage}\' is not configured');
    }
    return store.read<T>(model, meta, where, options);
}

export function remove<T extends IModel>(model: new() => T, where?: any, options?: IRemoveOptions): Promise<T[]> {
    checkIsModelConstructor(model);
    let meta = registry.getMeta(model.name);

    let store = storage.get(meta.storage);
    if (!storage) {
        throw new Error('remove() error - model storage \'${vals.__meta__.storage}\' is not configured');
    }
    return store.read<T>(model, meta, where, options);
}
