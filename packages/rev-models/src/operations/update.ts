import { IValidationOptions, validate } from './validate';
import { Model } from '../models/model';
import { ModelOperationResult, IOperationMeta } from './operationresult';
import { checkMetadataInitialised } from '../models/meta';
import * as backends from '../backends';
import { IModelOperation } from './operation';

export interface IUpdateOptions {
    where?: object;
    fields?: string[];
    validation?: IValidationOptions;
}

export interface IUpdateMeta extends IOperationMeta {
    total_count: number;
}

export const DEFAULT_UPDATE_OPTIONS: IUpdateOptions = {};

export function update<T extends Model>(model: T, options?: IUpdateOptions): Promise<ModelOperationResult<T, IUpdateMeta>> {
    return new Promise((resolve, reject) => {

        checkMetadataInitialised(model.constructor);
        let meta = model.getMeta();
        let backend = backends.get(meta.backend);
        let opts: IUpdateOptions = Object.assign({}, DEFAULT_UPDATE_OPTIONS, options);

        if (!opts.where || typeof opts.where != 'object') {
            throw new Error('update() must be called with a where clause');
        }

        let operation: IModelOperation = {
            operation: 'update',
            where: opts.where
        };
        let operationResult = new ModelOperationResult<T, IUpdateMeta>(operation);
        validate(model, operation, opts.validation ? opts.validation : null)
            .then((validationResult) => {

                if (!validationResult.valid) {
                    throw operationResult.createValidationError(validationResult);
                }
                else {
                    operationResult.validation = validationResult;
                }

                return backend.update<typeof model>(model, opts.where, operationResult, opts);

            })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
}
