import { IModelMeta } from '../models/meta';
import { IModel, IModelOperation } from '../models/index';
import { IValidationOptions, ModelValidationResult } from '../models/validation';
import { Field, TextField, NumberField, SelectionField } from './index';
export interface IFieldValidator {
    <T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
}
export interface IAsyncFieldValidator {
    <T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): Promise<void>;
}
export declare function requiredValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function stringValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function stringEmptyValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function regExValidator<T extends IModel>(model: T, field: TextField, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function numberValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function integerValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function booleanValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function minStringLengthValidator<T extends IModel>(model: T, field: TextField, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function maxStringLengthValidator<T extends IModel>(model: T, field: TextField, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function minValueValidator<T extends IModel>(model: T, field: TextField | NumberField, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function maxValueValidator<T extends IModel>(model: T, field: TextField | NumberField, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function singleSelectionValidator<T extends IModel>(model: T, field: SelectionField, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function listEmptyValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function multipleSelectionValidator<T extends IModel>(model: T, field: SelectionField, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function dateOnlyValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function timeOnlyValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
export declare function dateTimeValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void;
