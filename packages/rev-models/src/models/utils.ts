import { Model } from './model';

export function checkIsModelConstructor(model: any) {
    if (!model || typeof model != 'function' || !model.name) {
        throw new Error('ModelError: Supplied model is not a model constructor.');
    }
    if (!(model.prototype instanceof Model)) {
        throw new Error('ModelError: Models must extend the rev-models.Model class.');
    }
}
