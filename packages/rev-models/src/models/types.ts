
import { Field } from '../fields/field';
import { IBackend } from '../backends';
import { IModelOperationResult, IOperationMeta } from '../operations/operationresult';
import { ModelValidationResult, IModelValidationResult } from '../validation/validationresult';
import { IModelOperation } from '../operations/operation';

export interface IValidationOptions {
    timeout?: number;
    fields?: string[];
}

/**
 * @private
 * (although will be needed for custom field validators)
 */
export interface IValidationContext {
    manager: IModelManager;
    operation: IModelOperation;
    result: ModelValidationResult;
    options?: IValidationOptions;
}

export interface IModel {
    [fieldName: string]: any;
    validate?(vc: IValidationContext): void;
    validateAsync?(vc: IValidationContext): Promise<void>;
}

export interface IModelMeta<T> {
    ctor?: new(...args: any[]) => T;
    name?: string;
    label?: string;
    fields?: Field[];
    fieldsByName?: {
        [fieldName: string]: Field
    };
    primaryKey?: string;
    backend?: string;
    stored?: boolean;
}

/**
 * @private
 */
export type ModelCtor = new(...args: any[]) => IModel;

export interface ICreateOptions {
    validation?: IValidationOptions;
}

/**
 * @private
 */
export interface ICreateMeta extends IOperationMeta {
    // For future use
}

export interface IUpdateOptions {
    where?: object;
    fields?: string[];
    validation?: IValidationOptions;
}

/**
 * @private
 */
export interface IUpdateMeta extends IOperationMeta {
    totalCount: number;
}

export interface IRemoveOptions {
    where?: object;
}

/**
 * @private
 */
export interface IRemoveMeta extends IOperationMeta {
    totalCount: number;
}

export interface IReadOptions {
    where?: object;
    orderBy?: string[];
    limit?: number;
    offset?: number;
    related?: string[];
    rawValues?: string[];
}

/**
 * @private
 */
export type IRawValues = Array<{
    [fieldName: string]: any;
}>;

/**
 * @private
 */
export interface IReadMeta extends IOperationMeta {
    orderBy?: string[];
    limit: number;
    offset: number;
    totalCount: number;
    rawValues?: IRawValues;
}

/**
 * @private
 */
export interface IExecArgs {
    [key: string]: any;
}

export interface IExecOptions {
    method: string;
    args?: IExecArgs;
}

/**
 * @private
 */
export interface IExecMeta extends IOperationMeta {
    // For future use
}

/**
 * @private
 */
export interface IModelManager {
    isRegistered: (modelName: string) => boolean;
    register: <T extends IModel>(model: new(...args: any[]) => any, meta?: IModelMeta<T>) => void;
    getModelNames: () => string[];
    getModelMeta: (model: string | ModelCtor | IModel) => IModelMeta<any>;

    registerBackend: (backendName: string, backend: IBackend) => void;
    getBackend: (backendName: string) => IBackend;
    getBackendNames: () => string[];

    isNew: <T extends IModel>(model: T) => boolean;

    create: <T extends IModel>(model: T, options?: ICreateOptions) => Promise<IModelOperationResult<T, ICreateMeta>>;
    update: <T extends IModel>(model: T, options?: IUpdateOptions) => Promise<IModelOperationResult<T, IUpdateMeta>>;
    remove: <T extends IModel>(model: T, options?: IRemoveOptions) => Promise<IModelOperationResult<T, IRemoveMeta>>;
    read: <T extends IModel>(model: new() => T, options?: IReadOptions) => Promise<IModelOperationResult<T, IReadMeta>>;
    validate: <T extends IModel>(model: T, options?: IValidationOptions) => Promise<IModelValidationResult>;
    exec: <R>(model: IModel, options?: IExecOptions) => Promise<IModelOperationResult<R, any>>;

    hydrate: <T extends IModel>(model: new() => T, data: any) => T;
}
