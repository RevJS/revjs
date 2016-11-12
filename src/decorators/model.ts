
import * as fields from '../fields';
import { IModel } from '../model';
export const t = fields;

export interface IFieldTypeCtor {
    new (label: string, options: fields.IFieldOptions): fields.FieldType;
}

function initMeta(obj: IModel) {
    if (!obj.__meta__) {
        obj.__meta__ = {
            label: null,
            fields: {}
        };
    }
}

export function field(label: string, type: IFieldTypeCtor, options?: fields.IFieldOptions): any {
    return function(targetObj: IModel, propertyName: string) {
        initMeta(targetObj);
        targetObj.__meta__.fields[propertyName] = new type(label, options || fields.DEFAULT_FIELD_OPTIONS);
    };
}

export function model(label: string): any {
    return function(targetObj: any, propertyName: string) {
        initMeta(targetObj.prototype);
        targetObj.prototype.__meta__.label = label;
    };
}
