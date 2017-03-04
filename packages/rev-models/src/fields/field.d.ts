import { IModel, IModelMeta, IModelOperation } from '../models';
import { ModelValidationResult, IValidationOptions } from '../models/validation';
import { IFieldValidator, IAsyncFieldValidator } from './validators';
export interface IFieldOptions {
    required?: boolean;
}
export declare const DEFAULT_FIELD_OPTIONS: IFieldOptions;
export declare function getOptions(options?: IFieldOptions): IFieldOptions;
export declare class Field {
    name: string;
    label: string;
    options: IFieldOptions;
    validators: IFieldValidator[];
    asyncValidators: IAsyncFieldValidator[];
    constructor(name: string, label: string, options?: IFieldOptions);
    validate<T extends IModel>(model: T, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): Promise<ModelValidationResult>;
}
