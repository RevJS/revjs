
import { IModel } from '../models/types';
import { ModelManager } from '../models/manager';

export function hydrate<T extends IModel>(manager: ModelManager, model: new() => T, data: any): T {

    let meta = manager.getModelMeta(model);
    let instance = new model();

    if (data && typeof data == 'object') {
        // In future, this may also do data conversion, etc.
        for (let field of meta.fields) {
            if (typeof data[field.name] != 'undefined') {
                instance[field.name] = data[field.name];
            }
        }
    }

    return instance;

}
