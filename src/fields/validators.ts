import { IModel, IModelMeta, ValidationMode } from './../model/index';
import { ModelValidationResult } from './../model/validationresult';
import { Field, TextField, NumberField, SelectionField, IValidationOptions } from './index';
import { VALIDATION_MESSAGES as msg } from './validationmsg';
import { isSet } from '../utils';

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

export function regExValidator<T extends IModel>(model: T, field: TextField, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] == 'string'
            && typeof field.options.regEx == 'object'
            && field.options.regEx instanceof RegExp
            && !field.options.regEx.test(model[field.name])) {
        result.addFieldError(
            field.name,
            msg.no_regex_match(field.label),
            { validator: 'no_regex_match' }
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
    if (isSet(model[field.name]) && !(/^(-?[1-9][0-9]*|0)$/.test(model[field.name]))) {
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

export function minStringLengthValidator<T extends IModel>(model: T, field: TextField, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] == 'string'
            && model[field.name].length < field.options.minLength) {
        result.addFieldError(
            field.name,
            msg.min_string_length(field.label, field.options.minLength),
            { validator: 'min_string_length' }
        );
    }
}

export function maxStringLengthValidator<T extends IModel>(model: T, field: TextField, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] == 'string'
            && model[field.name].length > field.options.maxLength) {
        result.addFieldError(
            field.name,
            msg.max_string_length(field.label, field.options.maxLength),
            { validator: 'max_string_length' }
        );
    }
}

export function minValueValidator<T extends IModel>(model: T, field: TextField | NumberField, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])
            && model[field.name] < field.options.minValue) {
        result.addFieldError(
            field.name,
            msg.min_value(field.label, field.options.minValue),
            { validator: 'min_value' }
        );
    }
}

export function maxValueValidator<T extends IModel>(model: T, field: TextField | NumberField, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])
            && model[field.name] > field.options.maxValue) {
        result.addFieldError(
            field.name,
            msg.max_value(field.label, field.options.maxValue),
            { validator: 'max_value' }
        );
    }
}

export function singleSelectionValidator<T extends IModel>(model: T, field: SelectionField, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])) {
        for (let opt of field.selection) {
            if (opt[0] == model[field.name]) {
                return;
            }
        }
        result.addFieldError(
            field.name,
            msg.no_selection_match(field.label),
            { validator: 'no_selection_match' }
        );
    }
}

export function multipleSelectionValidator<T extends IModel>(model: T, field: SelectionField, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])) {
        if (typeof model[field.name] != 'object' || !(model[field.name] instanceof Array)) {
            result.addFieldError(
                field.name,
                msg.selection_not_an_array(field.label),
                { validator: 'selection_not_an_array' }
            );
        }
        else {
            let matches = 0;
            for (let val of model[field.name]) {
                for (let opt of field.selection) {
                    if (opt[0] == val) {
                        matches++;
                        break;
                    }
                }
            }
            if (matches < model[field.name].length) {
                result.addFieldError(
                    field.name,
                    msg.no_selection_match(field.label),
                    { validator: 'no_selection_match' }
                );
            }
        }
    }
}

let dateOnlyRegex = /^[0-9]{4}-[01][0-9]-[0-3][0-9]$/;
let timeOnlyRegex = /^[0-2][0-9]:[0-5][0-9]:[0-5][0-9]$/;
let dateTimeRegex = /^[0-9]{4}-[01][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]$/;

export function dateOnlyValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])) {
        if (typeof model[field.name] == 'object' && model[field.name] instanceof Date) {
            return;
        }
        if (typeof model[field.name] != 'string'
                || !((<string> model[field.name]).match(dateOnlyRegex))
                || !Date.parse(model[field.name])) {
            result.addFieldError(
                field.name,
                msg.not_a_date(field.label),
                { validator: 'not_a_date' }
            );
        }
    }
}

export function timeOnlyValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])) {
        if (typeof model[field.name] == 'object' && model[field.name] instanceof Date) {
            return;
        }
        if (typeof model[field.name] != 'string'
                || !((<string> model[field.name]).match(timeOnlyRegex))
                || !Date.parse('2000-01-01T' + model[field.name])) {
            result.addFieldError(
                field.name,
                msg.not_a_time(field.label),
                { validator: 'not_a_time' }
            );
        }
    }
}

export function dateTimeValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])) {
        if (typeof model[field.name] == 'object' && model[field.name] instanceof Date) {
            return;
        }
        if (typeof model[field.name] != 'string'
                || !((<string> model[field.name]).match(dateTimeRegex))
                || !Date.parse(model[field.name])) {
            result.addFieldError(
                field.name,
                msg.not_a_datetime(field.label),
                { validator: 'not_a_datetime' }
            );
        }
    }
}
