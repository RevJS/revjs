
import { Field } from '../fields/field';
import { IModel, IModelMeta, IModelManager } from './types';

export const DISALLOWED_FIELD_NAMES = [
    'validate',
    'validateAsync'
];

function populateMetaFromClassFields<T extends IModel>(model: new(...args: any[]) => T, meta: Partial<IModelMeta<T>>) {
    // Load fields from prototype __fields property if present (fields added via decorators)
    let proto = model.prototype;
    if (proto.__fields) {
        if (typeof proto.__fields != 'object' || !(proto.__fields instanceof Array)) {
            throw new Error(`MetadataError (${meta.name}): Model __fields property must be an array.`);
        }
        if (!meta.fields) {
            meta.fields = [];
        }
        if (!(meta.fields instanceof Array)) {
            throw new Error(`MetadataError (${meta.name}): Model metadata fields entry must be an array.`);
        }
        for (let field of proto.__fields) {
            meta.fields.push(field);
        }
    }
}

/**
 * @private
 */
export function initialiseMeta<T extends IModel>(manager: IModelManager, model: new(...args: any[]) => T, meta?: Partial<IModelMeta<T>>): IModelMeta<T> {

    if (!meta) {
        meta = {};
    }

    // Populate default metadata
    meta.name = meta.name ? meta.name : model.name;
    meta.label = meta.label ? meta.label : meta.name;
    meta.backend = meta.backend ? meta.backend : 'default';
    meta.stored = (meta.stored === undefined) ? true : meta.stored ? true : false;
    meta.ctor = model;
    meta.fieldsByName = {};

    // Check model name
    if (model.name != meta.name) {
        throw new Error(`MetadataError (${model.name}): Model name does not match meta.name.`);
    }

    // Validate specified back end
    let backends = manager.getBackendNames();
    if (backends.indexOf(meta.backend) < 0) {
        throw new Error(`MetadataError (${meta.name}): Backend "${meta.backend}" is not registered.`);
    }

    populateMetaFromClassFields(model, meta);

    // Check fields data
    if (!meta.fields || !(meta.fields instanceof Array)) {
        throw new Error(`MetadataError (${meta.name}): You must define the fields metadata for the model.`);
    }
    for (let field of meta.fields) {
        if (!field || typeof field != 'object' || !(field instanceof Field)) {
            throw new Error(`MetadataError (${meta.name}): One or more entries in the fields metadata is not an instance of rev.Field.`);
        }
        if (DISALLOWED_FIELD_NAMES.indexOf(field.name) > -1) {
            throw new Error(`MetadataError (${meta.name}): Field name is not allowed: ${field.name}`);
        }
    }
    if (meta.primaryKey) {
        if (typeof meta.primaryKey != 'string') {
            throw new Error(`MetadataError (${meta.name}): primaryKey must be a string containing the primary key field name.`);
        }
    }

    // Check field definitions and populate fieldsByName
    for (let field of meta.fields) {
        if (field.name in meta.fieldsByName) {
            throw new Error(`MetadataError (${meta.name}): Field "${field.name}" is defined more than once.`);
        }
        meta.fieldsByName[field.name] = field;
        if (field.options.primaryKey) {
            if (meta.primaryKey) {
                throw new Error(`MetadataError (${meta.name}): More than one field has been set as the primaryKey. Composite primary keys are not currently supported.`);
            }
            meta.primaryKey = field.name;
        }
    }
    if (meta.primaryKey && !(meta.primaryKey in meta.fieldsByName)) {
        throw new Error(`MetadataError (${meta.name}): Primary key field "${meta.primaryKey}" is not defined.`);
    }

    return meta as IModelMeta<T>;
}

/**
 * @private
 */
export function checkMetadataInitialised(meta: any): void {
    if (!meta || typeof meta != 'object'
            || !meta.fields || typeof meta.fields != 'object' || !(meta.fields instanceof Array)
            || !meta.fieldsByName || typeof meta.fieldsByName != 'object') {
        throw new Error('MetadataError: Model metadata has not been initialised.');
    }
}
