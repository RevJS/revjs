
import { Field } from '../fields/field';
import { IModel } from './model';
import { ModelManager } from './manager';

export interface IModelMeta<T> {
    ctor?: new(...args: any[]) => T;
    name?: string;
    label?: string;
    fields?: Field[];
    fieldsByName?: {
        [fieldName: string]: Field
    };
    primaryKey?: string[];
    backend?: string;
    stored?: boolean;
}

export const DISALLOWED_FIELD_NAMES = [
    'validate',
    'validateAsync'
];

function populateMetaFromClassFields<T extends IModel>(model: new(...args: any[]) => T, meta: IModelMeta<T>) {
    // Load fields from prototype __fields property if present (fields added via decorators)
    let proto = model.prototype;
    if (proto.__fields) {
        if (typeof proto.__fields != 'object' || !(proto.__fields instanceof Array)) {
            throw new Error('MetadataError: Model __fields property must be an array.');
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
    }
}

export function initialiseMeta<T extends IModel>(manager: ModelManager, model: new(...args: any[]) => T, meta?: IModelMeta<T>): IModelMeta<T> {

    if (!meta) {
        meta = {};
    }

    populateMetaFromClassFields(model, meta);

    // Check fields data
    if (!meta.fields || !(meta.fields instanceof Array)) {
        throw new Error('MetadataError: You must define the fields metadata for the model.');
    }
    for (let field of meta.fields) {
        if (!field || typeof field != 'object' || !(field instanceof Field)) {
            throw new Error(`MetadataError: One or more entries in the fields metadata is not an instance of rev.Field.`);
        }
        if (DISALLOWED_FIELD_NAMES.indexOf(field.name) > -1) {
            throw new Error(`MetadataError: Field name is not allowed: ${field.name}`);
        }
    }
    if (meta.primaryKey) {
        if (typeof meta.primaryKey != 'object' || !(meta.primaryKey instanceof Array)) {
            throw new Error(`MetadataError: primaryKey must be an array of field names.`);
        }
    }
    else {
        meta.primaryKey = [];
    }

    // Populate default metadata
    if (meta.name) {
        if (model.name != meta.name) {
            throw new Error('MetadataError: Model name does not match meta.name. To register the model under a different name you should rename its constructor.');
        }
    }
    else {
        meta.name = model.name;
    }
    meta.label = meta.label ? meta.label : meta.name;
    meta.backend = meta.backend ? meta.backend : 'default';
    meta.stored = (meta.stored === undefined) ? true : meta.stored ? true : false;
    meta.ctor = model;
    meta.fieldsByName = {};

    // Validate specified back end
    let backends = manager.getBackendNames();
    if (backends.indexOf(meta.backend) < 0) {
        throw new Error(`MetadataError: Backend "${meta.backend}" is not registered.`);
    }

    // Check field definitions and populate fieldsByName
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

    return meta;
}

export function checkMetadataInitialised(meta: any): void {
    if (!meta || typeof meta != 'object'
            || !meta.fields || typeof meta.fields != 'object' || !(meta.fields instanceof Array)
            || !meta.fieldsByName || typeof meta.fieldsByName != 'object') {
        throw new Error('MetadataError: Model metadata has not been initialised.');
    }
}
