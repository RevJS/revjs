import { IModel, IModelManager, IValidationOptions } from '../../models/types';
import { Field } from '../../fields/field';
import { IModelOperation } from '../../operations/operation';
import { isSet } from '../../utils/index';
import { VALIDATION_MESSAGES as msg } from '../validationmsg';
import { ModelValidationResult } from '../validationresult';

export function singleSelectionValidator<T extends IModel>(manager: IModelManager, model: T, field: any, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
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

export function listEmptyValidator<T extends IModel>(manager: IModelManager, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
    if (typeof model[field.name] == 'object' && model[field.name] instanceof Array
            && model[field.name].length == 0) {
        result.addFieldError(
            field.name,
            msg.list_empty(field.name),
            'list_empty'
        );
    }
}

export function multipleSelectionValidator<T extends IModel>(manager: IModelManager, model: T, field: any, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): void {
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
