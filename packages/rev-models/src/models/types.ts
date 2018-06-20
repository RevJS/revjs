
import { Field } from '../fields/field';
import { IBackend } from '../backends';
import { IModelOperationResult, IOperationMeta } from '../operations/operationresult';
import { ModelValidationResult, IModelValidationResult } from '../validation/validationresult';
import { IModelOperation } from '../operations/operation';

/**
 * @private
 */
export interface IValidationOptions {
    timeout?: number;
    fields?: string[];
}

/**
 * The IValidationContext interface represents the object passed to
 * [[IModel.validate]] and [[IModel.validateAsync]] methods
 */
export interface IValidationContext {
    /**
     * The associated ModelManager
     */
    manager: IModelManager;
    /**
     * The requested operation that the validation is being run for
     */
    operation: IModelOperation;
    /**
     * The current ModelValidationResult. You can use the methods on this object
     * to register any validation errors
     */
    result: ModelValidationResult;
    /**
     * Any options specified for the validation
     */
    options?: IValidationOptions;
}

/**
 * The IDefaultsContext interface represents the object passed to the
 * [[IModel.defaults]] method
 *
 * This interface will most likely be extended with additional contextual
 * information in the future
 */
export interface IDefaultsContext {
    /**
     * The associated ModelManager
     */
    manager: IModelManager;
}

/**
 * The IModel interface defines the standard methods that RevJS models can
 * implement.
 *
 * The below code gives an example of defining both validate() and
 * validateAsync() methods for a model:
 *
 * ```ts
 * [[include:examples/src/defining_and_using_models/custom_validation.ts]]
 * ```
 */
export interface IModel {
    [fieldName: string]: any;
    /**
     * You should use this method (and not the constructor) to set any default
     * field values by assigning them to `this`. You can use the objects
     * passed in the [[IDefaultsContext]] to help determine what defaults to set.
     */
    defaults?(ctx: IDefaultsContext): void;
    /**
     * You can define any synchronous model validation logic in this method.
     * Use the `vc.result` ([[ModelValidationResult]]) object to record any
     * validation errors.
     */
    validate?(ctx: IValidationContext): void;
    /**
     * You can define any asynchronous model validation logic in this method.
     * This method must return a promise. Use the `vc.result`
     * ([[ModelValidationResult]]) object to record any validation errors.
     */
    validateAsync?(ctx: IValidationContext): Promise<void>;
}

/**
 * The IModelMeta interface represents the metadata that RevJS stores for a
 * model. This information can optionally be provided when registering models
 * via [[ModelManager.register]].
 */
export interface IModelMeta<T> {
    /**
     * The model Class / constructor function
     */
    ctor: new(...args: any[]) => T;
    /**
     * The model name
     */
    name: string;
    /**
     * A user-friendly name for the model
     */
    label?: string;
    /**
     * The array of [[Field]]s defined for the object
     */
    fields: Field[];
    /**
     * The model [[Field]]s, indexed by field name
     */
    fieldsByName: {
        [fieldName: string]: Field
    };
    /**
     * The name of the model's Primary Key field
     */
    primaryKey?: string;
    /**
     * The name of the backend used to store the model
     */
    backend: string;
    /**
     * A boolean indicating whether the model can be stored in the backend
     */
    stored: boolean;
}

/**
 * @private
 */
export type ModelCtor = new(...args: any[]) => IModel;

/**
 * @private
 */
export interface ICreateOptions {
    validation?: IValidationOptions;
}

/**
 * @private
 */
export interface ICreateMeta extends IOperationMeta {
    // For future use
}

/**
 * @private
 */
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

/**
 * @private
 */
export interface IRemoveOptions {
    where?: object;
}

/**
 * @private
 */
export interface IRemoveMeta extends IOperationMeta {
    totalCount: number;
}

/**
 * @private
 */
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

/**
 * @private
 */
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
    getNew: <T extends IModel>(model: new() => T) => T;

    create: <T extends IModel>(model: T, options?: ICreateOptions) => Promise<IModelOperationResult<T, ICreateMeta>>;
    update: <T extends IModel>(model: T, options?: IUpdateOptions) => Promise<IModelOperationResult<T, IUpdateMeta>>;
    remove: <T extends IModel>(model: T, options?: IRemoveOptions) => Promise<IModelOperationResult<T, IRemoveMeta>>;
    read: <T extends IModel>(model: new() => T, options?: IReadOptions) => Promise<IModelOperationResult<T, IReadMeta>>;
    validate: <T extends IModel>(model: T, options?: IValidationOptions) => Promise<IModelValidationResult>;
    exec: <R>(model: IModel, options: IExecOptions) => Promise<IModelOperationResult<R, any>>;

    hydrate: <T extends IModel>(model: new() => T, data: any) => T;
}
