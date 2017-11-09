import { IModel, IModelMeta } from '../models/types';

export function getModelPrimaryKeyQuery<T extends IModel>(model: T, meta: IModelMeta<T>) {
    if (!meta.primaryKey || meta.primaryKey.length == 0) {
        throw new Error('KeyError: no primaryKey defined');
    }
    else {
        let pkQuery: object = {};
        for (let field of meta.primaryKey) {
            if (typeof model[field] == 'undefined') {
                throw new Error(`KeyError: primary key field '${field}' is undefined`);
            }
            pkQuery[field] = model[field];
        }
        return pkQuery;
    }
}
