
import { IModelMeta } from './types';

export function checkIsModelConstructor(model: any) {
    if (!model || typeof model != 'function' || !model.name) {
        throw new Error('ModelError: Supplied model is not a model constructor.');
    }
}

export function checkFieldsList(meta: IModelMeta<any>, fields: string[]) {
    if (!(fields instanceof Array)) {
        throw new Error('"fields" must be an array of field names');
    }
    for (let field of fields) {
        if (!(field in meta.fieldsByName)) {
            throw new Error(`"fields" error: Field '${field}' does not exist in model ${meta.name}`);
        }
    }
}
