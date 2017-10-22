
import { IModel } from '../models/model';
import { ModelManager } from '../models/manager';

export function hydrate<T extends IModel>(manager: ModelManager, model: new() => T, data: any): T {

    // In future, this may also instantiate related models, do data conversion, etc.
    let instance = new model();
    if (data && typeof data == 'object') {
        Object.assign(instance, data);
    }
    return instance;

}
