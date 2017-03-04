import { IModel } from './index';
import { IModelMeta } from './meta';

export function checkIsModelInstance(model: IModel) {
    if (!model || typeof model != 'object' || !model.constructor) {
        throw new Error('ModelError: Supplied model is not a model instance.');
    }
}

export function checkIsModelConstructor(model: new() => any) {
    if (!model || typeof model != 'function' || !model.name) {
        throw new Error('ModelError: Supplied model is not a model constructor.');
    }
}

export function checkMetadataInitialised<T>(meta: IModelMeta<T>) {
    if (!meta || typeof meta != 'object') {
        throw new Error('MetadataError: Supplied metadata is not an object.');
    }
    if (!meta.fields || typeof meta.fields != 'object' || !(meta.fields instanceof Array)) {
        throw new Error('MetadataError: Supplied metadata does not contain fields array.');
    }
    if (!meta.fieldsByName || typeof meta.fieldsByName != 'object') {
        throw new Error('MetadataError: Supplied metadata has not been initialised.');
    }
}
