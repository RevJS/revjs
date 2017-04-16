import { Model } from '../models/model';
import { ModelOperationResult, IOperationMeta } from './operationresult';
import { checkIsModelConstructor } from '../models/utils';
import { checkMetadataInitialised } from '../models/meta';
import * as backends from '../backends';
import { IModelOperation } from './operation';

export interface IRemoveOptions {
    // To be extended by other modules
}

export interface IRemoveMeta extends IOperationMeta {
    total_count: number;
}

export const DEFAULT_REMOVE_OPTIONS: IRemoveOptions = {};

export function remove<T extends Model>(model: new() => T, where?: object, options?: IRemoveOptions): Promise<ModelOperationResult<T, IRemoveMeta>> {
    return new Promise((resolve, reject) => {

        checkIsModelConstructor(model);
        checkMetadataInitialised(model);
        let meta = model.meta;
        let backend = backends.get(meta.backend);

        if (!where || typeof where != 'object') {
            // TODO: Be able to use a primary key for removals instead of where
            throw new Error('remove() must be called with a where clause');
        }

        let operation: IModelOperation = {
            operation: 'remove',
            where: where
        };
        let operationResult = new ModelOperationResult<T, IRemoveMeta>(operation);
        let opts = Object.assign({}, DEFAULT_REMOVE_OPTIONS, options);
        backend.remove<T>(model, where, operationResult, opts)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
}
