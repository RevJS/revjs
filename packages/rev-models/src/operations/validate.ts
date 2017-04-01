import { Model } from '../models/model';
import { checkMetadataInitialised } from '../models/meta';
import { IModelOperation } from './operation';
import { ModelValidationResult } from '../validation/validationresult';
import { VALIDATION_MESSAGES as msg } from '../validation/validationmsg';

export interface IValidationOptions {
    timeout?: number;
}

export function modelValidate<T extends Model>(model: T, operation?: IModelOperation, options?: IValidationOptions): Promise<ModelValidationResult> {
    return new Promise((resolve, reject) => {

        checkMetadataInitialised(model.constructor);
        let meta = model.getMeta();

        let timeout = options && options.timeout ? options.timeout : 5000;
        let result = new ModelValidationResult();

        // First, check if model contains fields that are not in meta
        for (let field of Object.keys(model)) {
            if (!(field in meta.fieldsByName)) {
                result.addModelError(msg.extra_field(field), 'extra_field');
            }
        }

        // Trigger field validation
        let promises: Array<Promise<ModelValidationResult>> = [];
        for (let field of meta.fields) {
            promises.push(field.validate(model, operation, result, options));
        }
        Promise.all(promises)
            .then(() => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });

        setTimeout(() => {
            reject(new Error(`modelValidate() - timed out after ${timeout} milliseconds`));
        }, timeout);
    });
}
