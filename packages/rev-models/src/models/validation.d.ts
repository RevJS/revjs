import { IModel, IModelOperation } from './index';
import { IModelMeta } from './meta';
export interface IValidationOptions {
    timeout?: number;
}
export interface IFieldError {
    message: string;
    code?: string;
    [key: string]: any;
}
export interface IModelError {
    message: string;
    code?: string;
    [key: string]: any;
}
export declare class ModelValidationResult {
    valid: boolean;
    fieldErrors: {
        [fieldName: string]: IFieldError[];
    };
    modelErrors: IModelError[];
    validationFinished: boolean;
    constructor(valid?: boolean);
    addFieldError(fieldName: string, message: string, code?: string, data?: Object): void;
    addModelError(message: string, code?: string, data?: Object): void;
}
export declare function validateModel<T extends IModel>(model: T, meta: IModelMeta<T>, operation: IModelOperation, options?: IValidationOptions): Promise<ModelValidationResult>;
export declare function validateModelRemoval<T extends IModel>(meta: IModelMeta<T>, operation: IModelOperation, options?: IValidationOptions): Promise<ModelValidationResult>;
