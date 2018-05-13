
import { IModel, IModelManager, IRemoveOptions, IRemoveMeta } from '../models/types';
import { ModelOperationResult } from './operationresult';
import { IModelOperation } from './operation';
import { getModelPrimaryKeyQuery } from './utils';
import { IRemoveParams } from '../backends/backend';

/**
 * @private
 */
export const DEFAULT_REMOVE_OPTIONS: IRemoveOptions = {};

/**
 * @private
 * Documentation in ModelManager class
 */
export async function remove<T extends IModel>(manager: IModelManager, model: T, options?: IRemoveOptions): Promise<ModelOperationResult<T, IRemoveMeta>> {

    let meta = manager.getModelMeta(model);
    if (!meta.stored) {
        throw new Error('Cannot call remove() on models with stored: false');
    }

    let backend = manager.getBackend(meta.backend);
    let opts = Object.assign({}, DEFAULT_REMOVE_OPTIONS, options) as IRemoveParams;

    if (!opts.where || typeof opts.where != 'object') {
        if (!meta.primaryKey || meta.primaryKey.length == 0) {
            throw new Error('remove() must be called with a where clause for models with no primaryKey');
        }
        else {
            opts.where = getModelPrimaryKeyQuery(model, meta);
        }
    }

    let operation: IModelOperation = {
        operationName: 'remove',
        where: opts.where
    };
    let operationResult = new ModelOperationResult<T, IRemoveMeta>(operation);
    return backend.remove<T>(manager, model, opts, operationResult);

}
