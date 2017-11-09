import { IModel, IModelManager } from '../../models/types';
import { Field } from '../../fields/field';
import { IModelOperation } from '../../operations/operation';
import { isSet } from '../../utils/index';
import { VALIDATION_MESSAGES as msg } from '../validationmsg';
import { ModelValidationResult } from '../validationresult';
import { IValidationOptions } from '../../operations/validate';

let dateOnlyRegex = /^[0-9]{4}-[01][0-9]-[0-3][0-9]$/;
let timeOnlyRegex = /^[0-2][0-9]:[0-5][0-9]:[0-5][0-9]$/;
let dateTimeRegex = /^[0-9]{4}-[01][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]$/;

export function dateOnlyValidator<T extends IModel>(manager: IModelManager, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
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

export function timeOnlyValidator<T extends IModel>(manager: IModelManager, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
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

export function dateTimeValidator<T extends IModel>(manager: IModelManager, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
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
