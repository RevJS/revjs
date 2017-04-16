import { Model } from '../models/model';
import { ModelOperationResult } from './operationresult';
import { checkIsModelConstructor } from '../models/utils';
import { checkMetadataInitialised } from '../models/meta';
import * as backends from '../backends';
import { IModelOperation } from './operation';

export interface IRemoveOptions {
    limit?: number;
}

export function remove<T extends Model>(model: new() => T, where?: object, options?: IRemoveOptions): Promise<ModelOperationResult<T>> {
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
        let operationResult = new ModelOperationResult<T>(operation);

        backend.remove<T>(model, where, operationResult, options)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
}
