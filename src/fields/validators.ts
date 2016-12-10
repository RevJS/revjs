import { IModel, IModelMeta, ValidationMode } from './../model/index';
import { ModelValidationResult } from './../model/validationresult';
import { Field, SelectionField, IValidationOptions } from './index';
import { VALIDATION_MESSAGES as msg } from './validationmsg';

function isSet(value: any) {
    return (typeof value != 'undefined' && value !== null);
}

export function requiredValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (!isSet(model[field.name])) {
        result.addFieldError(
            field.name,
            msg.required(field.label),
            { validator: 'required' }
        );
    }
}

export function stringValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name]) && typeof model[field.name] != 'string') {
        result.addFieldError(
            field.name,
            msg.not_a_string(field.label),
            { validator: 'not_a_string' }
        );
    }
}

export function stringEmptyValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] != 'string'
            || !model[field.name]) {
        result.addFieldError(
            field.name,
            msg.string_empty(field.label),
            { validator: 'string_empty' }
        );
    }
}

export function numberValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name]) && (
        isNaN(model[field.name]) || model[field.name] === '')) {
        result.addFieldError(
            field.name,
            msg.not_a_number(field.label),
            { validator: 'not_a_number' }
        );
    }
}

export function integerValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name]) && !(/^\d+$/.test(model[field.name]))) {
        result.addFieldError(
            field.name,
            msg.not_an_integer(field.label),
            { validator: 'not_an_integer' }
        );
    }
}

export function booleanValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name]) && typeof model[field.name] != 'boolean') {
        result.addFieldError(
            field.name,
            msg.not_a_boolean(field.label),
            { validator: 'not_a_boolean' }
        );
    }
}

export function minStringLengthValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] == 'string'
            && model[field.name].length < field.options.minLength) {
        result.addFieldError(
            field.name,
            msg.min_string_length(field.label, field.options.minLength),
            { validator: 'min_string_length' }
        );
    }
}

export function maxStringLengthValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] == 'string'
            && model[field.name].length > field.options.maxLength) {
        result.addFieldError(
            field.name,
            msg.max_string_length(field.label, field.options.maxLength),
            { validator: 'max_string_length' }
        );
    }
}

export function minValueValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])
            && model[field.name] < field.options.minValue) {
        result.addFieldError(
            field.name,
            msg.min_value(field.label, field.options.minValue),
            { validator: 'min_value' }
        );
    }
}

export function maxValueValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])
            && model[field.name] > field.options.maxValue) {
        result.addFieldError(
            field.name,
            msg.max_value(field.label, field.options.maxValue),
            { validator: 'max_value' }
        );
    }
}

export function selectionValidator<T extends IModel>(model: T, field: SelectionField, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])) {
        for (let opt of field.selection) {
            if (opt[0] == model[field.name]) {
                return;
            }
        }
        result.addFieldError(
            field.name,
            msg.invalid_selection(field.label),
            { validator: 'invalid_selection' }
        );
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
