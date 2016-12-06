import { ModelValidationResult } from './validationresult';
import { ValidationMode, IModel, IModelMeta, checkIsModelInstance, checkIsModelConstructor } from './';
import { IValidationOptions } from '../fields';
import { ICreateOptions, IReadOptions, IUpdateOptions, IRemoveOptions } from './';
import { registry } from '../registry';
import * as storage from '../storage';

// TODO: validate() function that does not require meta (gets it from the registry)

export function validateAgainstMeta<T extends IModel>(model: T, meta: IModelMeta<T>, mode: ValidationMode, options?: IValidationOptions): Promise<ModelValidationResult> {
    return new Promise((resolve, reject) => {
        /*checkIsModelInstance(model);
        for (let field of meta.fields) {
            field.validateValue(model[field.name], options);
            // TODO: Possibly check for extra fields not in meta?
            // TODO: Async Validation
        }*/
        reject(new Error('Noooooo!!!!'));
    });
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
