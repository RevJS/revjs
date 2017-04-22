
import { Model } from '../models/model';
import { ModelOperationResult, IOperationMeta } from './operationresult';
import { IModelOperation } from './operation';
import { ModelRegistry } from '../registry/registry';

export interface IRemoveOptions {
    where?: object;
}

export interface IRemoveMeta extends IOperationMeta {
    total_count: number;
}

export const DEFAULT_REMOVE_OPTIONS: IRemoveOptions = {};

export function remove<T extends Model>(registry: ModelRegistry, model: new() => T, options?: IRemoveOptions): Promise<ModelOperationResult<T, IRemoveMeta>> {
    return new Promise((resolve, reject) => {

        let meta = registry.getModelMeta(model);
        let backend = registry.getBackend(meta.backend);
        let opts = Object.assign({}, DEFAULT_REMOVE_OPTIONS, options);

        if (!opts.where || typeof opts.where != 'object') {
            // TODO: Be able to use a primary key for removals instead of where
            throw new Error('remove() must be called with a where clause');
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
