import { Model } from '../models/model';
import { IModelOperation } from './operation';
import { ModelValidationResult } from '../validation/validationresult';
import { VALIDATION_MESSAGES as msg } from '../validation/validationmsg';
import { ModelRegistry } from '../registry/registry';

export interface IValidationOptions {
    timeout?: number;
}

export function validate<T extends Model>(registry: ModelRegistry, model: T, operation?: IModelOperation, options?: IValidationOptions): Promise<ModelValidationResult> {
    return new Promise((resolve, reject) => {

        let meta = registry.getModelMeta(model);

        let timeout = options && options.timeout ? options.timeout : 5000;
        let result = new ModelValidationResult();

        // First, check if model contains fields that are not in meta
        for (let field of Object.keys(model)) {
            if (!(field in meta.fieldsByName)) {
                result.addModelError(msg.extra_field(field), 'extra_field');
            }
        }

        // Trigger field validation
        let promises: Array<Promise<any>> = [];
        for (let field of meta.fields) {
            promises.push(field.validate(registry, model, operation, result, options));
        }
        if (meta.validateAsync) {
            promises.push(meta.validateAsync(model, operation, result, options));
        }
        Promise.all(promises)
            .then(() => {
                if (meta.validate) {
                    meta.validate(model, operation, result, options);
                }
            })
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
