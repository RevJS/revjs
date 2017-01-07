import { IModel } from './index';
import { checkIsModelInstance, checkIsModelConstructor } from './utils';
import { IValidationOptions, validateAgainstMeta, ModelValidationResult } from './validation';
import { registry } from '../registry';
import { OPERATION_MESSAGES as msg } from './operationmsg';
import * as storage from '../storage';
import { IWhereQuery } from '../operators/operators';

export type ModelOperation = 'create' | 'update' | 'remove';

export interface IOperationError {
    message: string;
    [key: string]: any;
}

export class ModelOperationResult<T> {
    public success: boolean;
    public validation?: ModelValidationResult;
    public createdModel?: T;
    public errors: IOperationError[];

    constructor(public operation: ModelOperation) {
        this.success = true;
        this.errors = [];
    }

    public addError(message: string, data?: Object) {
        if (!message) {
            throw new Error(`ModelOperationResult Error: A message must be specified for the operation error.`);
        }
        this.success = false;
        let operationError = {
            message: message
        };
        if (data) {
            if (typeof data != 'object') {
                throw new Error(`ModelOperationResult Error: You cannot add non-object data to an operation result.`);
            }
            Object.assign(operationError, data);
        }
        this.errors.push(operationError);
    }
}

export interface ICreateOptions {
    validation?: IValidationOptions;
}

export interface IReadOptions {
    limit?: number;
    offset?: number;
    fields?: string[];
}

export interface IUpdateOptions {
    limit?: number;
    validation?: IValidationOptions;
}

export interface IRemoveOptions {
    limit?: number;
    validation?: IValidationOptions;
}

export function create<T extends IModel>(model: T, options?: ICreateOptions): Promise<ModelOperationResult<T>> {
    return new Promise((resolve, reject) => {

        checkIsModelInstance(model);

        let meta = registry.getMeta(model.constructor.name);
        let store = storage.get(meta.storage);
        if (meta.singleton) {
            throw new Error('create() cannot be called on singleton models');
        }
        if (!storage) {
            throw new Error('create() error - model storage \'${vals.__meta__.storage}\' is not configured');
        }

        let operationResult = new ModelOperationResult('create');

        validateAgainstMeta(model, meta, 'create', options ? options.validation : null)
            .then((validationResult) => {

                operationResult.validation = validationResult;

                if (validationResult.valid) {
                    resolve(store.create<typeof model>(model, meta,  options));
                }
                else {
                    operationResult.addError(msg.failed_validation(meta.name), { code: 'failed_validation' });
                    resolve(operationResult);
                }

            })
            .catch((err) => {
                reject(err);
            });
    });
}

export function update<T extends IModel>(model: T, where?: IWhereQuery, options?: IUpdateOptions): Promise<ModelOperationResult<T>> {
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

export function read<T extends IModel>(model: new() => T, where?: IWhereQuery, options?: IReadOptions): Promise<T[]> {
    checkIsModelConstructor(model);
    let meta = registry.getMeta(model.name);

    let store = storage.get(meta.storage);
    if (!storage) {
        throw new Error('read() error - model storage \'${vals.__meta__.storage}\' is not configured');
    }
    return store.read<T>(model, meta, where, options);
}

export function remove<T extends IModel>(model: new() => T, where?: IWhereQuery, options?: IRemoveOptions): Promise<ModelOperationResult<T>> {
    checkIsModelConstructor(model);
    let meta = registry.getMeta(model.name);

    let store = storage.get(meta.storage);
    if (!storage) {
        throw new Error('remove() error - model storage \'${vals.__meta__.storage}\' is not configured');
    }
    return store.remove<T>(model, meta, where, options);
}
