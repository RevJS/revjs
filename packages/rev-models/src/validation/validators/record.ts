import { IModel, IModelManager } from '../../models/types';
import { IModelOperation } from '../../operations/operation';
import { isSet } from '../../utils/index';
import { VALIDATION_MESSAGES as msg } from '../validationmsg';
import { ModelValidationResult } from '../validationresult';
import { IValidationOptions } from '../../operations/validate';
import { Field } from '../../fields';

export function recordClassValidator<T extends IModel>(manager: IModelManager, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])) {
        let val = model[field.name];
        if (typeof val != 'object'
            || !val.constructor
            || !val.constructor.name
            || val.constructor.name != field.options.model) {

                result.addFieldError(
                    field.name,
                    msg.invalid_record_class(field.name),
                    'invalid_record_class'
                );
        }
    }
}

export function recordListClassValidator<T extends IModel>(manager: IModelManager, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] != 'undefined') {
        let fieldVal = model[field.name];
        if (!(fieldVal instanceof Array)) {
            result.addFieldError(
                field.name,
                msg.invalid_record_list_data(field.name),
                'invalid_record_list_data'
            );
        }
        else {
            fieldVal.forEach((val) => {
                if (typeof val != 'object'
                    || !val.constructor
                    || !val.constructor.name
                    || val.constructor.name != field.options.model) {
                        result.addFieldError(
                            field.name,
                            msg.invalid_record_list_class(field.name),
                            'invalid_record_list_class'
                        );
                }
            });
        }
    }
}
