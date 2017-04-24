
import { IValidationOptions, validate } from './validate';
import { Model } from '../models/model';
import { ModelOperationResult, IOperationMeta } from './operationresult';
import { IModelOperation } from './operation';
import { ModelRegistry } from '../registry/registry';
import { getModelPrimaryKeyQuery } from './utils';

export interface IUpdateOptions {
    where?: object;
    fields?: string[];
    validation?: IValidationOptions;
}

export interface IUpdateMeta extends IOperationMeta {
    total_count: number;
}

export const DEFAULT_UPDATE_OPTIONS: IUpdateOptions = {};

export function update<T extends Model>(registry: ModelRegistry, model: T, options?: IUpdateOptions): Promise<ModelOperationResult<T, IUpdateMeta>> {
    return new Promise((resolve, reject) => {

        let meta = registry.getModelMeta(model);
        let backend = registry.getBackend(meta.backend);
        let opts: IUpdateOptions = Object.assign({}, DEFAULT_UPDATE_OPTIONS, options);

        if (!opts.where || typeof opts.where != 'object') {
            if (!meta.primaryKey || meta.primaryKey.length == 0) {
                throw new Error('update() must be called with a where clause for models with no primaryKey');
            }
            else {
                opts.where = getModelPrimaryKeyQuery(model, meta);
            }
        }

        let operation: IModelOperation = {
            operation: 'update',
            where: opts.where
        };
        let operationResult = new ModelOperationResult<T, IUpdateMeta>(operation);
        validate(registry, model, operation, opts.validation ? opts.validation : null)
            .then((validationResult) => {

                if (!validationResult.valid) {
                    throw operationResult.createValidationError(validationResult);
                }
                else {
                    operationResult.validation = validationResult;
                }

                return backend.update<typeof model>(registry, model, opts.where, operationResult, opts);

            })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
}
