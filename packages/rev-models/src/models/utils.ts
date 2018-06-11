
import { IModelMeta } from './types';

/**
 * @private
 */
export function checkIsValidModelConstructor(model: any) {
    if (!model || typeof model != 'function' || !model.name) {
        throw new Error('ModelError: Supplied model is not a model constructor.');
    }
    let instance: any;
    try {
        instance = new model();
    }
    catch (e) {
        throw new Error(`ModelError: constructor threw an error when called with no arguments: ${e.message}`);
    }
    if (Object.keys(instance).length) {
        throw new Error('ModelError: constructor must not set default field values. You should use a defaults() method instead.');
    }
}

/**
 * @private
 */
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
