import { Model, IModelMeta } from 'rev-models';

export interface IFormMeta {
    title?: string;
    fields: string[];
}

export function checkFormMeta<T extends Model>(modelMeta: IModelMeta<T>, formMeta: IFormMeta) {

    if (!formMeta || !formMeta.fields || !(formMeta.fields instanceof Array)) {
        throw new Error('FormMetadataError: Form metadata must contain a "fields" array.');
    }
    let fieldNames: any = {};
    for (let field of formMeta.fields) {
        if (!field || typeof field != 'string') {
            throw new Error(`FormMetadataError: One or more entries in the fields list is not a string.`);
        }
        if (field in fieldNames) {
            throw new Error(`FormMetadataError: Duplicate field '${field}' in the fields array.`);
        }
        if (!(field in modelMeta.fieldsByName)) {
            throw new Error(`FormMetadataError: Field '${field}' is not defined for model '${modelMeta.name}'.`);
        }
        fieldNames[field] = true;
    }

}
