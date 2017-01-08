import { IModel } from './index';
import { checkIsModelInstance } from './utils';
import { IValidationOptions, validateAgainstMeta, ModelValidationResult } from './validation';
import { registry } from '../registry';
import { OPERATION_MESSAGES as msg } from './operationmsg';
import * as storage from '../storage';
import { IWhereQuery } from '../operators/operators';

export type ModelOperation = 'create' | 'read' | 'update' | 'remove';

export interface IOperationError {
    message: string;
    [key: string]: any;
}

export class ModelOperationResult<T> {
    public success: boolean;
    public validation?: ModelValidationResult;
    public result?: T;
    public results?: T[];
    public errors: IOperationError[];

    constructor(public operation: ModelOperation) {
        this.success = true;
        this.errors = [];
        this.validation = null;
        this.result = null;
        this.results = null;
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

        let operationResult = new ModelOperationResult<T>('create');
        validateAgainstMeta(model, meta, 'create', options ? options.validation : null)
            .then((validationResult) => {

                operationResult.validation = validationResult;

                if (validationResult.valid) {
                    store.create<typeof model>(model, meta, operationResult, options)
                        .then(() => {
                            resolve(operationResult);
                        })
                        .catch((err) => {
                            reject(err);
                        });
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
    return new Promise((resolve, reject) => {

        checkIsModelInstance(model);

        // TODO: Validate 'where' parameter

        let meta = registry.getMeta(model.constructor.name);
        let store = storage.get(meta.storage);

        if (!meta.singleton && !where) {
            throw new Error('update() must be called with a where clause for non-singleton models');
        }

        let operationResult = new ModelOperationResult<T>('update');
        validateAgainstMeta(model, meta, 'update', options ? options.validation : null)
            .then((validationResult) => {

                operationResult.validation = validationResult;

                if (validationResult.valid) {
                    store.update<typeof model>(model, meta, where, operationResult, options)
                        .then(() => {
                            resolve(operationResult);
                        })
                        .catch((err) => {
                            reject(err);
                        });
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

export function remove<T extends IModel>(model: new() => T, where?: IWhereQuery, options?: IRemoveOptions): Promise<ModelOperationResult<T>> {
    /*checkIsModelConstructor(model);
    let meta = registry.getMeta(model.name);

    let store = storage.get(meta.storage);
    if (!storage) {
        throw new Error('remove() error - model storage \'${vals.__meta__.storage}\' is not configured');
    }
    return store.remove(model, meta, where, options);*/
    return Promise.resolve();
}

export function read<T extends IModel>(model: new() => T, where?: IWhereQuery, options?: IReadOptions): Promise<ModelOperationResult<T>> {
    /*checkIsModelConstructor(model);
    let meta = registry.getMeta(model.name);

    let operationResult = new ModelOperationResult<T>('read');
    let store = storage.get(meta.storage);
    if (!storage) {
        throw new Error('read() error - model storage \'${vals.__meta__.storage}\' is not configured');
    }
    return store.read(model, meta, where, operationResult, options);*/
    return Promise.resolve();
}
