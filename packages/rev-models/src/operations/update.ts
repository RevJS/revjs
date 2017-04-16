import { IValidationOptions, validate } from './validate';
import { Model } from '../models/model';
import { ModelOperationResult } from './operationresult';
import { checkMetadataInitialised } from '../models/meta';
import * as backends from '../backends';
import { IModelOperation } from './operation';

export interface IUpdateOptions {
    validation?: IValidationOptions;
}

export const DEFAULT_UPDATE_OPTIONS: IUpdateOptions = {};

export function update<T extends Model>(model: T, where?: object, options?: IUpdateOptions): Promise<ModelOperationResult<T>> {
    return new Promise((resolve, reject) => {

        // TODO: Validate 'where' parameter

        checkMetadataInitialised(model.constructor);
        let meta = model.getMeta();
        let backend = backends.get(meta.backend);

        if (!where || typeof where != 'object') {
            throw new Error('update() must be called with a where clause');
        }

        let operation: IModelOperation = {
            operation: 'update',
            where: where
        };
        let operationResult = new ModelOperationResult<T>(operation);
        let opts = Object.assign({}, DEFAULT_UPDATE_OPTIONS, options);
        validate(model, operation, opts.validation ? opts.validation : null)
            .then((validationResult) => {

                if (!validationResult.valid) {
                    throw operationResult.createValidationError(validationResult);
                }
                else {
                    operationResult.validation = validationResult;
                }

                return backend.update<typeof model>(model, where, operationResult, opts);

            })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
}
