import { Model } from '../models/model';
import { IWhereQuery } from '../queries/query';
import { ModelOperationResult } from './operationresult';
import { checkMetadataInitialised } from '../models/meta';
import * as backends from '../backends';
import { IModelOperation } from './operation';

export interface IRemoveOptions {
    limit?: number;
}

export function remove<T extends Model>(model: T, where?: IWhereQuery, options?: IRemoveOptions): Promise<ModelOperationResult<T>> {
    return new Promise((resolve, reject) => {

        if (!where || typeof where != 'object') {
            throw new Error('remove() must be called with a where clause');
        }

        checkMetadataInitialised(model.constructor);
        let meta = model.getMeta();
        let backend = backends.get(meta.backend);

        if (meta.singleton) {
            throw new Error('remove() cannot be called on singleton models');
        }

        let operation: IModelOperation = {
            operation: 'remove',
            where: where
        };
        let operationResult = new ModelOperationResult<T>(operation);

        backend.remove<T>(model, where, operationResult, options)
            .then(() => {
                resolve(operationResult);
            })
            .catch((err) => {
                reject(err);
            });
    });
}
