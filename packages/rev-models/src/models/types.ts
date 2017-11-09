
import { IValidationContext, IValidationOptions } from '../operations/validate';
import { Field } from '../fields/field';
import { IBackend } from '../backends';
import { IModelOperationResult } from '../operations/operationresult';
import { ICreateOptions, ICreateMeta } from '../operations/create';
import { IUpdateOptions, IUpdateMeta } from '../operations/update';
import { IRemoveOptions, IRemoveMeta } from '../operations/remove';
import { IReadOptions, IReadMeta } from '../operations/read';
import { IExecArgs, IExecOptions } from '../operations/exec';
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
    primaryKey?: string[];
    backend?: string;
    stored?: boolean;
}

export type ModelCtor = new(...args: any[]) => IModel;

export interface IModelManager {
    isRegistered: (modelName: string) => boolean;
    register: <T extends IModel>(model: new(...args: any[]) => T, meta?: IModelMeta<T>) => void;
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
