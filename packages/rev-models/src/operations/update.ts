
import { IValidationOptions, validate } from './validate';
import { Model } from '../models/model';
import { ModelOperationResult, IOperationMeta } from './operationresult';
import { IModelOperation } from './operation';
import { ModelManager } from '../models/manager';
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

export function update<T extends Model>(manager: ModelManager, model: T, options?: IUpdateOptions): Promise<ModelOperationResult<T, IUpdateMeta>> {
    return new Promise((resolve, reject) => {

        if (typeof model != 'object' || !(model instanceof Model)) {
            throw new Error('Specified model is not a Model instance');
        }

        let meta = manager.getModelMeta(model);
        if (!meta.stored) {
            throw new Error('Cannot call update() on models with stored: false');
        }

        let backend = manager.getBackend(meta.backend);
        let opts: IUpdateOptions = Object.assign({}, DEFAULT_UPDATE_OPTIONS, options);

        if (!opts.where || typeof opts.where != 'object') {
            if (!meta.primaryKey || meta.primaryKey.length == 0) {
                throw new Error('update() must be called with a where clause for models with no primaryKey');
            }
            else {
                opts.where = getModelPrimaryKeyQuery(model, meta);
            }
        }

        if (opts.fields) {
            if (typeof opts.fields != 'object' || !(opts.fields instanceof Array)) {
                throw new Error('update() options.fields must be an array of field names');
            }
            for (let field of opts.fields) {
                if (!(field in meta.fieldsByName)) {
                    throw new Error(`update() options.fields error: Field '${field}' does not exist in ${meta.name}`);
                }
            }
        }

        let operation: IModelOperation = {
            operation: 'update',
            where: opts.where
        };
        let operationResult = new ModelOperationResult<T, IUpdateMeta>(operation);
        validate(manager, model, operation, opts.validation ? opts.validation : null)
            .then((validationResult) => {

                if (!validationResult.valid) {
                    throw operationResult.createValidationError(validationResult);
                }
                else {
                    operationResult.validation = validationResult;
                }

                return backend.update<typeof model>(manager, model, opts.where, operationResult, opts);

            })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
}
