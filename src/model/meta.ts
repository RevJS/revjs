import { ModelValidationResult } from './validationresult';
import { IModel, ModelOperation } from './index';
import { Field, IValidationOptions } from '../fields/index';

export interface IModelMeta<T> {
    name?: string;
    label?: string;
    fields: Field[];
    fieldsByName?: {
        [fieldName: string]: Field
    };
    singleton?: boolean;
    storage?: string;
    validate?: <T extends IModel>(model: T, operation: ModelOperation, result: ModelValidationResult, options?: IValidationOptions) => void;
    validateAsync?: <T extends IModel>(model: T, operation: ModelOperation, result: ModelValidationResult, options?: IValidationOptions) => Promise<void>;
}

export function initialiseMeta<T extends IModel>(model: new() => T, meta: IModelMeta<T>) {

    let modelName = model.name;

    // Check metadata
    if (!meta || !meta.fields || !(meta.fields instanceof Array)) {
        throw new Error('MetadataError: Model metadata must contain a "fields" definition.');
    }
    for (let field of meta.fields) {
        if (!field || typeof field != 'object' || !(field instanceof Field)) {
            throw new Error(`MetadataError: One or more entries in the fields metadata is not an instance of rev.Field.`);
        }
    }

    // Populate default metadata
    if (meta.name) {
        if (modelName != meta.name) {
            throw new Error('MetadataError: Model name does not match meta.name. To register the model under a different name you should rename its constructor.');
        }
    }
    else {
        meta.name = modelName;
    }
    meta.fieldsByName = {};
    for (let field of meta.fields) {
        if (field.name in meta.fieldsByName) {
            throw new Error(`MetadataError: Field "${field.name}" is defined more than once.`);
        }
        meta.fieldsByName[field.name] = field;
    }
    meta.storage = meta.storage ? meta.storage : 'default';
    meta.label = meta.label ? meta.label : meta.name;
    meta.singleton = meta.singleton ? true : false;

}
