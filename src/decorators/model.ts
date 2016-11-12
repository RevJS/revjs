
import * as fields from '../fields';
import { IModel, IModelOptions } from '../model';
import registry from '../model/registry';
export const t = fields;

export interface IFieldTypeCtor {
    new (label: string, options: fields.IFieldOptions): fields.FieldType;
}

function initMeta(obj: IModel) {
    if (!obj.__meta__) {
        obj.__meta__ = {
            name: null,
            label: null,
            fields: {},
            fieldsOrder: [],
            registry: null,
            singleton: false,
            storage: 'default'
        };
    }
}

export function field(label: string, type: IFieldTypeCtor, options?: fields.IFieldOptions): any {
    return function(targetObj: IModel, propertyName: string) {
        initMeta(targetObj);
        targetObj.__meta__.fields[propertyName] = new type(label, options || fields.DEFAULT_FIELD_OPTIONS);
        targetObj.__meta__.fieldsOrder.push(propertyName);
    };
}

export function model(label: string, options?: IModelOptions): any {
    return function(targetObj: any, propertyName: string) {
        initMeta(targetObj.prototype);
        let modelName = targetObj.prototype.constructor.name;
        targetObj.prototype.__meta__.name = modelName;
        targetObj.prototype.__meta__.label = label;
        targetObj.prototype.__meta__.singleton = options && options.singleton ? true : false;
        targetObj.prototype.__meta__.storage = options && options.storage ? options.storage : 'default';

        registry.addModel(modelName, new targetObj());  // TODO: Might want to make this optional
    };
}
