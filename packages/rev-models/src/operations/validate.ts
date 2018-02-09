import { IModel, IModelManager, IValidationOptions } from '../models/types';
import { IModelOperation } from './operation';
import { ModelValidationResult } from '../validation/validationresult';
import { VALIDATION_MESSAGES as msg } from '../validation/validationmsg';
import { withTimeout } from '../utils';
import { checkFieldsList } from '../models/utils';

export async function validate<T extends IModel>(manager: IModelManager, model: T, operation?: IModelOperation, options?: IValidationOptions): Promise<ModelValidationResult> {

    let meta = manager.getModelMeta(model);

    let timeout = options && options.timeout ? options.timeout : 5000;
    let result = new ModelValidationResult();

    // Work out fields to be validated
    let fields: string[];
    if (options && options.fields) {
        checkFieldsList(meta, options.fields);
        fields = options.fields;
    }
    else {
        fields = Object.keys(meta.fieldsByName);
    }

    // Check for any unknown fields
    for (let field of Object.keys(model)) {
        if (!(field in meta.fieldsByName)) {
            result.addModelError(msg.extra_field(field), 'extra_field');
        }
    }

    // Trigger field validation
    let promises: Array<Promise<any>> = [];
    for (let fieldName of fields) {
        let fieldObj = meta.fieldsByName[fieldName];
        promises.push(fieldObj.validate(manager, model, operation, result, options));
    }
    await withTimeout(Promise.all(promises), timeout, 'validate()');

    // Trigger model validation
    if (typeof model.validate == 'function') {
        model.validate({ manager, operation, result, options });
    }
    if (typeof model.validateAsync == 'function') {
        await withTimeout(
            model.validateAsync({ manager, operation, result, options }),
            timeout, 'validate()');
    }

    return result;

}
