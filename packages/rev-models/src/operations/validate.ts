import { Model } from '../models/model';
import { IModelMeta, checkMetadataInitialised } from '../models/meta';
import { IModelOperation } from './operation';
import { ModelValidationResult } from '../validation/validationresult';
import { VALIDATION_MESSAGES as msg } from '../validation/validationmsg';

export interface IValidationOptions {
    timeout?: number;
}

export function modelValidate<T extends Model>(model: T, operation: IModelOperation, options?: IValidationOptions): Promise<ModelValidationResult> {
    return new Promise((resolve, reject) => {

        let meta = model.getMeta();
        checkMetadataInitialised(meta);

        if (!operation || typeof operation != 'object' || ['create', 'update'].indexOf(operation.name) == -1) {
            throw new Error('validateModel() - invalid operation specified - should either be a create or update operation.');
        }
        let timeout = options && options.timeout ? options.timeout : 5000;
        let result = new ModelValidationResult();
        // First, check if model contains fields that are not in meta
        for (let field in model) {
            if (!(field in meta.fieldsByName)) {
                result.addModelError(msg.extra_field(field), 'extra_field');
            }
        }
        // Trigger field validation
        let promises: Array<Promise<ModelValidationResult>> = [];
        for (let field of meta.fields) {
            promises.push(field.validate(model, meta, operation, result, options));
        }
        Promise.all(promises)
            .then(() => {
                // Trigger model validation
                model.validate(operation, result, options);
                return model.validateAsync(operation, result, options);
            })
            .then(() => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
        setTimeout(() => {
            reject(new Error(`validateModel() - timed out after ${timeout} milliseconds`));
        }, timeout);
    });
}

export function modelValidateForRemoval<T extends Model>(meta: IModelMeta, operation: IModelOperation, options?: IValidationOptions): Promise<ModelValidationResult> {
    return new Promise((resolve, reject) => {
        checkMetadataInitialised(meta);
        if (!operation || typeof operation != 'object' || operation.name != 'remove') {
            throw new Error('validateModelRemoval() - invalid operation specified - operation.name must be "remove".');
        }
        if (!operation.where || typeof operation.where != 'object') {
            throw new Error('validateModelRemoval() - invalid operation where clause specified.');
        }
        let timeout = options && options.timeout ? options.timeout : 5000;
        let result = new ModelValidationResult();

        if (meta.validateRemoval) {
            meta.validateRemoval(operation, result, options);
        }
        if (meta.validateRemovalAsync) {
            meta.validateRemovalAsync(operation, result, options)
                .then(() => {
                    resolve(result);
                })
                .catch((err) => {
                    reject(err);
                });
        }
        else {
            resolve(result);
        }
        setTimeout(() => {
            reject(new Error(`validateRemoval() - timed out after ${timeout} milliseconds`));
        }, timeout);
    });
}
