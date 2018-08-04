import { IModel, IModelMeta } from '../models/types';
import { IObject } from '../utils/types';

/**
 * @private
 */
export function getModelPrimaryKeyQuery<T extends IModel>(model: T, meta: IModelMeta<T>) {
    if (!meta.primaryKey) {
        throw new Error('KeyError: no primaryKey defined');
    }
    else {
        let pkQuery: IObject = {};
        if (typeof model[meta.primaryKey] == 'undefined') {
            throw new Error(`KeyError: primary key field '${meta.primaryKey}' is undefined`);
        }
        pkQuery[meta.primaryKey] = model[meta.primaryKey];
        return pkQuery;
    }
}
