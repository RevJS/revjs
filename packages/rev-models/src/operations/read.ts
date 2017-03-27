import { Model } from '../models/model';
import { IWhereQuery } from '../queries/query';
import { ModelOperationResult } from './operationresult';
import { checkIsModelConstructor } from '../models/utils';
import { checkMetadataInitialised } from '../models/meta';
import * as backends from '../backends';
import { IModelOperation } from './operation';

export interface IReadOptions {
    limit?: number;
    offset?: number;
    fields?: string[];
}

export function modelRead<T extends Model>(model: new() => T, where?: IWhereQuery, options?: IReadOptions): Promise<ModelOperationResult<T>> {
    return new Promise((resolve, reject) => {

        checkIsModelConstructor(model);

        let meta = model['getMeta']();
        checkMetadataInitialised(meta);

        if (meta.singleton && where) {
            throw new Error('read() cannot be called with a where clause for singleton models');
        }

        let store = backends.get(meta.backend);
        let operation: IModelOperation = {
            name: 'read',
            where: where
        };
        let operationResult = new ModelOperationResult<T>(operation);
        store.read(model, meta, where || {}, operationResult, options)
            .then(() => {
                resolve(operationResult);
            })
            .catch((err) => {
                reject(err);
            });
    });
}