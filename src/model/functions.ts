import { ModelValidationResult, IValidationOptions } from './validation';
import { IModelMeta } from './meta';
import { ModelOperation, IModel, checkIsModelInstance, checkIsModelConstructor } from './';
import { VALIDATION_MESSAGES as msg } from '../fields/validationmsg';
import { ICreateOptions, IReadOptions, IUpdateOptions, IRemoveOptions } from './';
import { registry } from '../registry';
import * as storage from '../storage';

// TODO: validate() function that does not require meta (gets it from the registry)

export function validateAgainstMeta<T extends IModel>(model: T, meta: IModelMeta<T>, operation: ModelOperation, options?: IValidationOptions): Promise<ModelValidationResult> {
    return new Promise((resolve, reject) => {
        checkIsModelInstance(model);
        let timeout = options && options.timeout ? options.timeout : 5000;
        let result = new ModelValidationResult();
        // First, check if model contains fields that are not in meta
        for (let field in model) {
            if (!(field in meta.fieldsByName)) {
                result.addModelError(msg.extra_field(field), {
                    validator: 'extra_field'
                });
            }
        }
        // Trigger field validation
        let promises: Array<Promise<ModelValidationResult>> = [];
        for (let field of meta.fields) {
            promises.push(field.validate(model, meta, operation, result, options));
        }
        Promise.all(promises)
            .then(() => {
                // Trigger model validation
                if (meta.validate) {
                    meta.validate(model, operation, result, options);
                }
                if (meta.validateAsync) {
                    return meta.validateAsync(model, operation, result, options);
                }
            })
            .then(() => {
                resolve(result);
            });
        setTimeout(() => {
            reject(new Error(`Model validateAgainstMeta() - timed out after ${timeout} milliseconds`));
        }, timeout);
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
