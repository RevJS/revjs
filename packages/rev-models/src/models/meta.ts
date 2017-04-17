import { Field } from '../fields/field';
import { Model } from './model';

export interface IModelMeta {
    ctor?: new(...args: any[]) => any;
    name?: string;
    label?: string;
    fields?: Field[];
    fieldsByName?: {
        [fieldName: string]: Field
    };
    primaryKey?: string[];
    backend?: string;
}

export function initialiseMeta<T extends Model>(model: new(...args: any[]) => T): void {

    let modelName = model.name;
    let meta: IModelMeta;
    if (model.hasOwnProperty('meta')) {
        meta = model.meta;
    }

    // Load fields from prototype __fields property if present (fields added via decorators)
    let proto = model.prototype;
    if (proto.__fields) {
        if (typeof proto.__fields != 'object' || !(proto.__fields instanceof Array)) {
            throw new Error('MetadataError: Model __fields property must be an array.');
        }
        if (!meta) {
            meta = { fields: [] };
        }
        if (!meta.fields) {
            meta.fields = [];
        }
        if (!(meta.fields instanceof Array)) {
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
    meta.ctor = model;
    if (meta.name) {
        if (modelName != meta.name) {
            throw new Error('MetadataError: Model name does not match meta.name. To register the model under a different name you should rename its constructor.');
        }
    }
    else {
        meta.name = modelName;
    }
    meta.fieldsByName = {};
    if (!meta.primaryKey) {
        meta.primaryKey = [];
    }
    for (let field of meta.fields) {
        if (field.name in meta.fieldsByName) {
            throw new Error(`MetadataError: Field "${field.name}" is defined more than once.`);
        }
        meta.fieldsByName[field.name] = field;
        if (field.options.primaryKey && meta.primaryKey.indexOf(field.name) == -1) {
            meta.primaryKey.push(field.name);
        }
    }
    for (let field of meta.primaryKey) {
        if (!(field in meta.fieldsByName)) {
            throw new Error(`MetadataError: Primary key field "${field}" is not defined.`);
        }
    }
    meta.backend = meta.backend ? meta.backend : 'default';
    meta.label = meta.label ? meta.label : meta.name;

    model.meta = meta;
}

export function checkMetadataInitialised(model: any): void {
    if (!model || typeof model != 'function') {
        throw new Error('MetadataError: Supplied model is not a class.');
    }
    let meta = model.meta;
    if (!meta || typeof meta != 'object'
            || !meta.fields || typeof meta.fields != 'object' || !(meta.fields instanceof Array)
            || !meta.fieldsByName || typeof meta.fieldsByName != 'object') {
        throw new Error('MetadataError: Model metadata has not been initialised.');
    }
}
