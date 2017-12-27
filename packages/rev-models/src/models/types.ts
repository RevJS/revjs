
import { IValidationContext, IValidationOptions } from '../operations/validate';
import { Field } from '../fields/field';
import { IBackend } from '../backends';
import { IModelOperationResult, IOperationMeta } from '../operations/operationresult';
import { ModelValidationResult } from '../validation/validationresult';

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

export type ModelCtor = new(...args: any[]) => IModel;

export interface ICreateOptions {
    validation?: IValidationOptions;
}

export interface ICreateMeta extends IOperationMeta {
    // For future use
}

export interface IUpdateOptions {
    where?: object;
    fields?: string[];
    validation?: IValidationOptions;
}

export interface IUpdateMeta extends IOperationMeta {
    total_count: number;
}

export interface IRemoveOptions {
    where?: object;
}

export interface IRemoveMeta extends IOperationMeta {
    total_count: number;
}

export interface IReadOptions {
    order_by?: string[];
    limit?: number;
    offset?: number;
    related?: string[];
    raw_values?: string[];
}

export type IRawValues = Array<{
    [fieldName: string]: any;
}>;

export interface IReadMeta extends IOperationMeta {
    order_by?: string[];
    limit: number;
    offset: number;
    total_count: number;
    raw_values?: IRawValues;
}

export interface IExecArgs {
    [key: string]: any;
}

export interface IExecOptions {
    // For future use
}

export interface IExecMeta extends IOperationMeta {
    // For future use
}

export interface IModelManager {
    isRegistered: (modelName: string) => boolean;
    register: <T extends IModel>(model: new(...args: any[]) => any, meta?: IModelMeta<T>) => void;
    getModelNames: () => string[];
    getModelMeta: (model: string | ModelCtor | IModel) => IModelMeta<any>;

    registerBackend: (backendName: string, backend: IBackend) => void;
    getBackend: (backendName: string) => IBackend;
    getBackendNames: () => string[];

    create: <T extends IModel>(model: T, options?: ICreateOptions) => Promise<IModelOperationResult<T, ICreateMeta>>;
    update: <T extends IModel>(model: T, options?: IUpdateOptions) => Promise<IModelOperationResult<T, IUpdateMeta>>;
    remove: <T extends IModel>(model: T, options?: IRemoveOptions) => Promise<IModelOperationResult<T, IRemoveMeta>>;
    read: <T extends IModel>(model: new() => T, where?: object, options?: IReadOptions) => Promise<IModelOperationResult<T, IReadMeta>>;
    validate: <T extends IModel>(model: T, options?: IValidationOptions) => Promise<ModelValidationResult>;
    exec: <R>(model: IModel, method: string, argObj?: IExecArgs, options?: IExecOptions) => Promise<IModelOperationResult<R, any>>;

    hydrate: <T extends IModel>(model: new() => T, data: any) => T;
}
