import { Field } from '../fields/field';
import { IModel, IModelOperation } from './index';
import { ModelValidationResult, IValidationOptions } from './validation';
export interface IModelMeta<T extends IModel> {
    name?: string;
    label?: string;
    fields?: Field[];
    fieldsByName?: {
        [fieldName: string]: Field;
    };
    singleton?: boolean;
    storage?: string;
    validate?: (model: T, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions) => void;
    validateAsync?: (model: T, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions) => Promise<void>;
    validateRemoval?: (operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions) => void;
    validateRemovalAsync?: (operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions) => Promise<void>;
}
export declare function initialiseMeta<T extends IModel>(model: new () => T, meta?: IModelMeta<T>): IModelMeta<T>;
