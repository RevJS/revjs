import { VALIDATION_MESSAGES as msg } from './validationmsg';
import { isSet } from '../utils';
import { Model } from '../models/model';
import { Field } from '../fields/field';
import { IModelOperation } from '../operations/operation';
import { ModelValidationResult } from './validationresult';
import { IValidationOptions } from '../operations/validate';
import { TextField, NumberField, SelectionField } from '../fields/index';
import { ModelRegistry } from '../registry/registry';

export type IFieldValidator =
    <T extends Model>(
        registry: ModelRegistry,
        model: T,
        field: Field,
        operation: IModelOperation,
        result: ModelValidationResult,
        options?: IValidationOptions) => void;

export type IAsyncFieldValidator =
    <T extends Model>(
        registry: ModelRegistry,
        model: T,
        field: Field,
        operation: IModelOperation,
        result: ModelValidationResult,
        options?: IValidationOptions) => Promise<void>;

export function requiredValidator<T extends Model>(registry: ModelRegistry, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (!isSet(model[field.name])) {
        result.addFieldError(
            field.name,
            msg.required(field.name),
            'required'
        );
    }
}

export function stringValidator<T extends Model>(registry: ModelRegistry, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name]) && typeof model[field.name] != 'string') {
        result.addFieldError(
            field.name,
            msg.not_a_string(field.name),
            'not_a_string'
        );
    }
}

export function stringEmptyValidator<T extends Model>(registry: ModelRegistry, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] == 'string'
            && model[field.name].length == 0) {
        result.addFieldError(
            field.name,
            msg.string_empty(field.name),
            'string_empty'
        );
    }
}

export function regExValidator<T extends Model>(registry: ModelRegistry, model: T, field: TextField, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
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

export function numberValidator<T extends Model>(registry: ModelRegistry, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name]) && (
        isNaN(model[field.name]) || model[field.name] === '')) {
        result.addFieldError(
            field.name,
            msg.not_a_number(field.name),
            'not_a_number'
        );
    }
}

export function integerValidator<T extends Model>(registry: ModelRegistry, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name]) && !(/^(-?[1-9][0-9]*|0)$/.test(model[field.name]))) {
        result.addFieldError(
            field.name,
            msg.not_an_integer(field.name),
            'not_an_integer'
        );
    }
}

export function booleanValidator<T extends Model>(registry: ModelRegistry, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name]) && typeof model[field.name] != 'boolean') {
        result.addFieldError(
            field.name,
            msg.not_a_boolean(field.name),
            'not_a_boolean'
        );
    }
}

export function minStringLengthValidator<T extends Model>(registry: ModelRegistry, model: T, field: TextField, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] == 'string'
            && model[field.name].length < field.options.minLength) {
        result.addFieldError(
            field.name,
            msg.min_string_length(field.name, field.options.minLength),
            'min_string_length'
        );
    }
}

export function maxStringLengthValidator<T extends Model>(registry: ModelRegistry, model: T, field: TextField, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] == 'string'
            && model[field.name].length > field.options.maxLength) {
        result.addFieldError(
            field.name,
            msg.max_string_length(field.name, field.options.maxLength),
            'max_string_length'
        );
    }
}

export function minValueValidator<T extends Model>(registry: ModelRegistry, model: T, field: TextField | NumberField, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])
            && model[field.name] < field.options.minValue) {
        result.addFieldError(
            field.name,
            msg.min_value(field.name, field.options.minValue),
            'min_value'
        );
    }
}

export function maxValueValidator<T extends Model>(registry: ModelRegistry, model: T, field: TextField | NumberField, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])
            && model[field.name] > field.options.maxValue) {
        result.addFieldError(
            field.name,
            msg.max_value(field.name, field.options.maxValue),
            'max_value'
        );
    }
}

export function singleSelectionValidator<T extends Model>(registry: ModelRegistry, model: T, field: SelectionField, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])) {
        for (let opt of field.options.selection) {
            if (opt[0] == model[field.name]) {
                return;
            }
        }
        result.addFieldError(
            field.name,
            msg.no_selection_match(field.name),
            'no_selection_match'
        );
    }
}

export function listEmptyValidator<T extends Model>(registry: ModelRegistry, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] == 'object' && model[field.name] instanceof Array
            && model[field.name].length == 0) {
        result.addFieldError(
            field.name,
            msg.list_empty(field.name),
            'list_empty'
        );
    }
}

export function multipleSelectionValidator<T extends Model>(registry: ModelRegistry, model: T, field: SelectionField, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])) {
        if (typeof model[field.name] != 'object' || !(model[field.name] instanceof Array)) {
            result.addFieldError(
                field.name,
                msg.selection_not_an_array(field.name),
                'selection_not_an_array'
            );
        }
        else {
            let matches = 0;
            for (let val of model[field.name]) {
                for (let opt of field.options.selection) {
                    if (opt[0] == val) {
                        matches++;
                        break;
                    }
                }
            }
            if (matches < model[field.name].length) {
                result.addFieldError(
                    field.name,
                    msg.no_selection_match(field.name),
                    'no_selection_match'
                );
            }
        }
    }
}

let dateOnlyRegex = /^[0-9]{4}-[01][0-9]-[0-3][0-9]$/;
let timeOnlyRegex = /^[0-2][0-9]:[0-5][0-9]:[0-5][0-9]$/;
let dateTimeRegex = /^[0-9]{4}-[01][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]$/;

export function dateOnlyValidator<T extends Model>(registry: ModelRegistry, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])) {
        if (typeof model[field.name] == 'object' && model[field.name] instanceof Date) {
            return;
        }
        if (typeof model[field.name] != 'string'
                || !(model[field.name].match(dateOnlyRegex))
                || !Date.parse(model[field.name])) {
            result.addFieldError(
                field.name,
                msg.not_a_date(field.name),
                'not_a_date'
            );
        }
    }
}

export function timeOnlyValidator<T extends Model>(registry: ModelRegistry, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])) {
        if (typeof model[field.name] == 'object' && model[field.name] instanceof Date) {
            return;
        }
        if (typeof model[field.name] != 'string'
                || !(model[field.name].match(timeOnlyRegex))
                || !Date.parse('2000-01-01T' + model[field.name])) {
            result.addFieldError(
                field.name,
                msg.not_a_time(field.name),
                'not_a_time'
            );
        }
    }
}

export function dateTimeValidator<T extends Model>(registry: ModelRegistry, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])) {
        if (typeof model[field.name] == 'object' && model[field.name] instanceof Date) {
            return;
        }
        if (typeof model[field.name] != 'string'
                || !(model[field.name].match(dateTimeRegex))
                || !Date.parse(model[field.name])) {
            result.addFieldError(
                field.name,
                msg.not_a_datetime(field.name),
                'not_a_datetime'
            );
        }
    }
}
