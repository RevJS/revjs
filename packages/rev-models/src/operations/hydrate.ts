
import { IModel, IModelManager } from '../models/types';
import { RelatedModelFieldBase } from '../fields';

export function hydrate<T extends IModel>(manager: IModelManager, model: new() => T, data: any): T {

    let meta = manager.getModelMeta(model);
    let instance = new model();

    if (data && typeof data == 'object') {
        for (let field of meta.fields) {
            if (typeof data[field.name] != 'undefined' && !(field instanceof RelatedModelFieldBase)) {
                instance[field.name] = field.fromBackendValue(manager, data[field.name]);
            }
        }
    }

    return instance;

}
