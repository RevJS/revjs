import { IModel, IModelMeta, ValidationMode } from './../model/index';
import { ModelValidationResult } from './../model/validationresult';
import { Field, IValidationOptions } from './index';
import { VALIDATION_MESSAGES as msg } from './validationmsg';

export function requiredValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] == 'undefined' || model[field.name] === null) {
        result.addFieldError(
            field.name,
            msg.required(field.label),
            { validator: 'required' }
        );
    }
}

export function stringValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] != 'string') {
        result.addFieldError(
            field.name,
            msg.not_a_string(field.label),
            { validator: 'not_a_string' }
        );
    }
}

export function stringEmptyValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] != 'string'
            || !model[field.name]
            || model[field.name] === '') {
        result.addFieldError(
            field.name,
            msg.string_empty(field.label),
            { validator: 'string_empty' }
        );
    }
}

export function numberValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isNaN(model[field.name])
            || model[field.name] === null
            || model[field.name] === '') {
        result.addFieldError(
            field.name,
            msg.not_a_number(field.label),
            { validator: 'not_a_number' }
        );
    }
}

export function integerValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (!(/^\d+$/.test(model[field.name]))) {
        result.addFieldError(
            field.name,
            msg.not_an_integer(field.label),
            { validator: 'not_an_integer' }
        );
    }
}

export function minStringLengthValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof field.options.minLength != 'undefined') {
        if (typeof model[field.name] == 'string'
                && model[field.name].length < field.options.minLength) {
            result.addFieldError(
                field.name,
                msg.min_string_length(field.label, field.options.minLength),
                { validator: 'min_string_length' }
            );
        }
    }
}

export function maxStringLengthValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof field.options.maxLength != 'undefined') {
        if (typeof model[field.name] == 'string'
                && model[field.name].length > field.options.maxLength) {
            result.addFieldError(
                field.name,
                msg.max_string_length(field.label, field.options.maxLength),
                { validator: 'max_string_length' }
            );
        }
    }
}

export function minValueValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof field.options.minValue != 'undefined') {
        if (typeof model[field.name] != 'undefined' && model[field.name] !== null
                && model[field.name] < field.options.minValue) {
            result.addFieldError(
                field.name,
                msg.min_value(field.label, field.options.minValue),
                { validator: 'min_value' }
            );
        }
    }
}

/* TODO...

 * Date Validator
 * DateTime Validator
 * Object validator

Q: Should we discard whitespace?
A: No - bad pattern


export function minValueValidator(field, value) {
    if (field.minValue !== null) {
        if (value < field.minValue) {
            return false;
        }
    }
    return true;
}

export function maxValueValidator(field, value) {
    if (field.maxValue !== null) {
        if (value > field.maxValue) {
            return false;
        }
    }
    return true;
}
*/
