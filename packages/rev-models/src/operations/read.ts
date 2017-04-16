import { Model } from '../models/model';
import { ModelOperationResult, IOperationMeta } from './operationresult';
import { checkIsModelConstructor } from '../models/utils';
import { checkMetadataInitialised } from '../models/meta';
import * as backends from '../backends';
import { IModelOperation } from './operation';

export interface IReadOptions {
    limit?: number;
    offset?: number;
}

export interface IReadMeta extends IOperationMeta {
    limit: number;
    offset: number;
    total_count: number;
}

export const DEFAULT_READ_OPTIONS: IReadOptions = {
    limit: 20,
    offset: 0
};

export function read<T extends Model>(model: new() => T, where?: object, options?: IReadOptions): Promise<ModelOperationResult<T, IReadMeta>> {
    return new Promise((resolve, reject) => {

        checkIsModelConstructor(model);
        checkMetadataInitialised(model);
        let meta = model.meta;
        let backend = backends.get(meta.backend);
        let operation: IModelOperation = {
            operation: 'read',
            where: where
        };
        let operationResult = new ModelOperationResult<T, IReadMeta>(operation);
        let opts = Object.assign({}, DEFAULT_READ_OPTIONS, options);
        backend.read(model, where || {}, operationResult, opts)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
}