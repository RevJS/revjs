import { Model } from './model';

export function checkIsModelInstance(model: Model) {
    if (!model || typeof model != 'object' || !model.constructor) {
        throw new Error('ModelError: Supplied model is not a model instance.');
    }
}

export function checkIsModelConstructor(model: new() => any) {
    if (!model || typeof model != 'function' || !model.name) {
        throw new Error('ModelError: Supplied model is not a model constructor.');
    }
}
