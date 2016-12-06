import { IModel, IModelMeta, ValidationMode } from './../model/index';
import { ModelValidationResult } from './../model/validationresult';
import { Field, IValidationOptions } from './index';
import { VALIDATION_MESSAGES as msg } from './validationmsg';

export function requiredValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void {
    if (field.options.required) {
        if (typeof model[field.name] === 'undefined' || model[field.name] === null) {
            result.addFieldError(
                field.name,
                msg.REQUIRED(field.label),
                { validator: 'REQUIRED' }
            );
        }
    }
}

/* TODO...
export function stringEmptyValidator(field: Field, value: any) {
    if (field.options.required && !value) {
        return false;
    }
    return true;
}

export function minLengthValidator(field, value) {
    if (field.minLength && value && value.length) {
        if (value.length < field.minLength) {
            return false;
        }
    }
    return true;
}

export function maxLengthValidator(field, value) {
    if (field.maxLength && value && value.length) {
        if (value.length > field.maxLength) {
            return false;
        }
    }
    return true;
}

export function numberValidator(field, value) {
    if (isNaN(value)) {
        return false;
    }
    return true;
}

export function integerValidator(field, value) {
    if (!(/^\d+$/.test(value))) {
        return false;
    }
    return true;
}

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
