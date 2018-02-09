import { IModel, IModelManager, IValidationOptions } from '../../models/types';
import { IModelOperation } from '../../operations/operation';
import { isSet } from '../../utils/index';
import { VALIDATION_MESSAGES as msg } from '../validationmsg';
import { ModelValidationResult } from '../validationresult';
import { Field } from '../../fields';

export function modelClassValidator<T extends IModel>(manager: IModelManager, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])) {
        let val = model[field.name];
        if (typeof val != 'object'
            || !val.constructor
            || !val.constructor.name
            || val.constructor.name != field.options.model) {

                result.addFieldError(
                    field.name,
                    msg.invalid_model_class(field.name),
                    'invalid_model_class'
                );
        }
    }
}

export function modelPrimaryKeyValidator<T extends IModel>(manager: IModelManager, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (isSet(model[field.name])) {
        const meta = manager.getModelMeta(field.options.model);
        if (!meta.primaryKey) {
            result.addFieldError(
                field.name,
                msg.missing_model_primary_key(field.name),
                'missing_model_primary_key'
            );
        }
        else {
            const pkValue = model[field.name][meta.primaryKey];
            if (!pkValue) {
                result.addFieldError(
                    field.name,
                    msg.missing_model_primary_key(field.name),
                    'missing_model_primary_key'
                );
            }
        }
    }
}

export function modelListClassValidator<T extends IModel>(manager: IModelManager, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] != 'undefined') {
        let fieldVal = model[field.name];
        if (!(fieldVal instanceof Array)) {
            result.addFieldError(
                field.name,
                msg.invalid_model_list_data(field.name),
                'invalid_model_list_data'
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
                            msg.invalid_model_list_class(field.name),
                            'invalid_model_list_class'
                        );
                }
            });
        }
    }
}
