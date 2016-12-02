import { IModel, IModelMeta, checkIsModelInstance, checkIsModelConstructor } from './';
import { IValidationOptions } from '../fields';
import { ICreateOptions, IReadOptions, IUpdateOptions, IRemoveOptions } from './';
import { registry } from '../registry';
import * as storage from '../storage';

export type ValidationMode = 'create' | 'update';

export function validate(mode: ValidationMode, model: IModel, meta: IModelMeta, options?: IValidationOptions) {
    if (typeof model != 'object') {
        throw new TypeError('validate() model must be an object');
    }
    for (let field of meta.fields) {
        field.validateValue(model[field.name], options);
        // TODO: Possibly check for extra fields not in meta?
        // TODO: Async Validation
    }
}

function getModelMeta(model: any, isConstructor: boolean = false): IModelMeta {
    let modelName = isConstructor ? model.name : model.constructor.name;
    if (!modelName) {
        throw new Error('Could not determine model name.');
    }
    return registry.getMeta(modelName);
}

export function create<T extends IModel>(model: T, options?: ICreateOptions): Promise<T> {

    checkIsModelInstance(model);
    let meta = getModelMeta(model);
    if (meta.singleton) {
        throw new Error('create() cannot be called on singleton models');
    }

    validate('create', model, meta, options ? options.validation : null);

    let store = storage.get(meta.storage);
    if (!storage) {
        throw new Error('create() error - model storage \'${vals.__meta__.storage}\' is not configured');
    }
    return store.create<typeof model>(model, meta,  options);
}

export function update<T extends IModel>(model: T, where?: any, options?: IUpdateOptions): Promise<boolean> {
    checkIsModelInstance(model);
    let meta = getModelMeta(model);

    // TODO: Get existing vals when appropriate

    validate('update', model, meta, options ? options.validation : null);

    let store = storage.get(meta.storage);
    if (!storage) {
        throw new Error('update() error - model storage \'${vals.__meta__.storage}\' is not configured');
    }
    return store.update(model, meta, where, options);
}

export function read<T extends IModel>(model: new() => T, where?: any, options?: IReadOptions): Promise<T[]> {
    checkIsModelConstructor(model);
    let meta = getModelMeta(model, true);

    let store = storage.get(meta.storage);
    if (!storage) {
        throw new Error('read() error - model storage \'${vals.__meta__.storage}\' is not configured');
    }
    return store.read<T>(model, meta, where, options);
}

export function remove<T extends IModel>(model: new() => T, where?: any, options?: IRemoveOptions): Promise<T[]> {
    checkIsModelConstructor(model);
    let meta = getModelMeta(model, true);

    let store = storage.get(meta.storage);
    if (!storage) {
        throw new Error('remove() error - model storage \'${vals.__meta__.storage}\' is not configured');
    }
    return store.read<T>(model, meta, where, options);
}
