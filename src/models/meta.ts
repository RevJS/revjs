import { Field } from '../fields/field';
import { IModel, IModelOperation } from './index';
import { ModelValidationResult, IValidationOptions } from './validation';

export interface IModelMeta<T extends IModel> {
    name?: string;
    label?: string;
    fields: Field[];
    fieldsByName?: {
        [fieldName: string]: Field
    };
    singleton?: boolean;
    storage?: string;
    validate?: (model: T, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions) => void;
    validateAsync?: (model: T, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions) => Promise<void>;
    validateRemoval?: (operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions) => void;
    validateRemovalAsync?: (operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions) => Promise<void>;
}

export function initialiseMeta<T extends IModel>(model: new() => T, meta?: IModelMeta<T>): IModelMeta<T> {

    let modelName = model.name;

    // Load fields from prototype __fields property if present (fields added via decorators)
    let proto = model.prototype;
    if (proto.__fields) {
        if (typeof proto.__fields != 'object' || !(proto.__fields instanceof Array)) {
            throw new Error('MetadataError: Model __fields property must be an array.');
        }
        if (!meta) {
            meta = { fields: [] };
        }
        if (!meta.fields || !(meta.fields instanceof Array)) {
            throw new Error('MetadataError: Model metadata fields entry must be an array.');
        }
        for (let field of proto.__fields) {
            meta.fields.push(field);
        }
        delete proto.__fields;
    }

    // Check metadata
    if (!meta || !meta.fields || !(meta.fields instanceof Array)) {
        throw new Error('MetadataError: You must define the fields metadata for the model.');
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

    return meta;
}
