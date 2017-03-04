import { IModel } from './index';
import { IValidationOptions, ModelValidationResult } from './validation';
import { IWhereQuery } from '../operators/operators';
export declare type ModelOperationType = 'create' | 'read' | 'update' | 'remove';
export interface IModelOperation {
    type: ModelOperationType;
    where?: IWhereQuery;
}
export interface IOperationError {
    message: string;
    code?: string;
    [key: string]: any;
}
export declare class ModelOperationResult<T> {
    operation: IModelOperation;
    success: boolean;
    validation?: ModelValidationResult;
    result?: T;
    results?: T[];
    errors: IOperationError[];
    constructor(operation: IModelOperation);
    addError(message: string, code?: string, data?: Object): void;
}
export interface ILoadOptions {
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
export declare function create<T extends IModel>(model: T, options?: ICreateOptions): Promise<ModelOperationResult<T>>;
export declare function update<T extends IModel>(model: T, where?: IWhereQuery, options?: IUpdateOptions): Promise<ModelOperationResult<T>>;
export declare function remove<T extends IModel>(model: new () => T, where?: IWhereQuery, options?: IRemoveOptions): Promise<ModelOperationResult<T>>;
export declare function read<T extends IModel>(model: new () => T, where?: IWhereQuery, options?: IReadOptions): Promise<ModelOperationResult<T>>;
