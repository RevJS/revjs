
import { IModel } from '../models/model';
import { IValidationOptions, validate } from './validate';
import { ModelOperationResult, IOperationMeta } from './operationresult';
import { IModelOperation } from './operation';
import { ModelManager } from '../models/manager';

export interface ICreateOptions {
    validation?: IValidationOptions;
}

export interface ICreateMeta extends IOperationMeta {
    // For future use
}

export const DEFAULT_CREATE_OPTIONS: ICreateOptions = {};

export function create<T extends IModel>(manager: ModelManager, model: T, options?: ICreateOptions): Promise<ModelOperationResult<T, ICreateMeta>> {
    return new Promise((resolve, reject) => {

        if (typeof model != 'object') {
            throw new Error('Specified model is not a Model instance');
        }

        let meta = manager.getModelMeta(model);
        if (!meta.stored) {
            throw new Error('Cannot call create() on models with stored: false');
        }

        let backend = manager.getBackend(meta.backend);

        let operation: IModelOperation = {
            operation: 'create'
        };
        let operationResult = new ModelOperationResult<T, ICreateMeta>(operation);
        let opts = Object.assign({}, DEFAULT_CREATE_OPTIONS, options);
        validate(manager, model, operation, opts.validation ? opts.validation : null)
            .then((validationResult) => {

                if (!validationResult.valid) {
                    throw operationResult.createValidationError(validationResult);
                }
                else {
                    operationResult.validation = validationResult;
                }

                return backend.create(manager, model, operationResult, opts);

            })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });

}
