
import { Model } from '../models/model';
import { ModelOperationResult, IOperationMeta } from './operationresult';
import { IModelOperation } from './operation';
import { ModelRegistry } from '../registry/registry';
import { getModelPrimaryKeyQuery } from './utils';

export interface IRemoveOptions {
    where?: object;
}

export interface IRemoveMeta extends IOperationMeta {
    total_count: number;
}

export const DEFAULT_REMOVE_OPTIONS: IRemoveOptions = {};

export function remove<T extends Model>(registry: ModelRegistry, model: T, options?: IRemoveOptions): Promise<ModelOperationResult<T, IRemoveMeta>> {
    return new Promise((resolve, reject) => {

        let meta = registry.getModelMeta(model);
        let backend = registry.getBackend(meta.backend);
        let opts = Object.assign({}, DEFAULT_REMOVE_OPTIONS, options);

        if (!opts.where || typeof opts.where != 'object') {
            if (!meta.primaryKey || meta.primaryKey.length == 0) {
                throw new Error('remove() must be called with a where clause for models with no primaryKey');
            }
            else {
                opts.where = getModelPrimaryKeyQuery(model, meta);
            }
        }

        let operation: IModelOperation = {
            operation: 'remove',
            where: opts.where
        };
        let operationResult = new ModelOperationResult<T, IRemoveMeta>(operation);
        backend.remove<T>(registry, model, opts.where, operationResult, opts)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
}
