import { VALIDATION_MESSAGES as msg } from '../validationmsg';
import { isSet } from '../../utils';
import { IModel } from '../../models/model';
import { Field } from '../../fields/field';
import { IModelOperation } from '../../operations/operation';
import { ModelValidationResult } from '../validationresult';
import { IValidationOptions } from '../../operations/validate';
import { TextField, NumberField } from '../../fields/index';
import { ModelManager } from '../../models/manager';

export type IFieldValidator =
    <T extends IModel>(
        manager: ModelManager,
        model: T,
        field: Field,
        operation: IModelOperation,
        result: ModelValidationResult,
        options?: IValidationOptions) => void;

export type IAsyncFieldValidator =
    <T extends IModel>(
        manager: ModelManager,
        model: T,
        field: Field,
        operation: IModelOperation,
        result: ModelValidationResult,
        options?: IValidationOptions) => Promise<void>;

export function requiredValidator<T extends IModel>(manager: ModelManager, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (!isSet(model[field.name])) {
        result.addFieldError(
            field.name,
            msg.required(field.name),
            'required'
        );
    }
}

export function stringValidator<T extends IModel>(manager: ModelManager, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name]) && typeof model[field.name] != 'string') {
        result.addFieldError(
            field.name,
            msg.not_a_string(field.name),
            'not_a_string'
        );
    }
}

export function stringEmptyValidator<T extends IModel>(manager: ModelManager, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] == 'string'
            && model[field.name].length == 0) {
        result.addFieldError(
            field.name,
            msg.string_empty(field.name),
            'string_empty'
        );
    }
}

export function regExValidator<T extends IModel>(manager: ModelManager, model: T, field: TextField, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] == 'string'
            && typeof field.options.regEx == 'object'
            && field.options.regEx instanceof RegExp
            && !field.options.regEx.test(model[field.name])) {
        result.addFieldError(
            field.name,
            msg.no_regex_match(field.name),
            'no_regex_match'
        );
    }
}

export function numberValidator<T extends IModel>(manager: ModelManager, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name]) && (
        isNaN(model[field.name]) || model[field.name] === '')) {
        result.addFieldError(
            field.name,
            msg.not_a_number(field.name),
            'not_a_number'
        );
    }
}

export function integerValidator<T extends IModel>(manager: ModelManager, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name]) && !(/^(-?[1-9][0-9]*|0)$/.test(model[field.name]))) {
        result.addFieldError(
            field.name,
            msg.not_an_integer(field.name),
            'not_an_integer'
        );
    }
}

export function booleanValidator<T extends IModel>(manager: ModelManager, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name]) && typeof model[field.name] != 'boolean') {
        result.addFieldError(
            field.name,
            msg.not_a_boolean(field.name),
            'not_a_boolean'
        );
    }
}

export function minStringLengthValidator<T extends IModel>(manager: ModelManager, model: T, field: TextField, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] == 'string'
            && model[field.name].length < field.options.minLength) {
        result.addFieldError(
            field.name,
            msg.min_string_length(field.name, field.options.minLength),
            'min_string_length'
        );
    }
}

export function maxStringLengthValidator<T extends IModel>(manager: ModelManager, model: T, field: TextField, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] == 'string'
            && model[field.name].length > field.options.maxLength) {
        result.addFieldError(
            field.name,
            msg.max_string_length(field.name, field.options.maxLength),
            'max_string_length'
        );
    }
}

export function minValueValidator<T extends IModel>(manager: ModelManager, model: T, field: TextField | NumberField, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])
            && model[field.name] < field.options.minValue) {
        result.addFieldError(
            field.name,
            msg.min_value(field.name, field.options.minValue),
            'min_value'
        );
    }
}

export function maxValueValidator<T extends IModel>(manager: ModelManager, model: T, field: TextField | NumberField, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])
            && model[field.name] > field.options.maxValue) {
        result.addFieldError(
            field.name,
            msg.max_value(field.name, field.options.maxValue),
            'max_value'
        );
    }
}
