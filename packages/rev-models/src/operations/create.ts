
import { Model } from '../models/model';
import { IValidationOptions, validate } from './validate';
import { ModelOperationResult, IOperationMeta } from './operationresult';
import { IModelOperation } from './operation';
import { ModelRegistry } from '../registry/registry';

export interface ICreateOptions {
    validation?: IValidationOptions;
}

export interface ICreateMeta extends IOperationMeta {
    // For future use
}

export const DEFAULT_CREATE_OPTIONS: ICreateOptions = {};

export function create<T extends Model>(registry: ModelRegistry, model: T, options?: ICreateOptions): Promise<ModelOperationResult<T, ICreateMeta>> {
    return new Promise((resolve, reject) => {

        let meta = registry.getModelMeta(model);
        let backend = registry.getBackend(meta.backend);

        let operation: IModelOperation = {
            operation: 'create'
        };
        let operationResult = new ModelOperationResult<T, ICreateMeta>(operation);
        let opts = Object.assign({}, DEFAULT_CREATE_OPTIONS, options);
        validate(registry, model, operation, opts.validation ? opts.validation : null)
            .then((validationResult) => {

                if (!validationResult.valid) {
                    throw operationResult.createValidationError(validationResult);
                }
                else {
                    operationResult.validation = validationResult;
                }

                return backend.create(model, operationResult, opts);

            })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });

}
