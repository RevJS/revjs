
import { Field, IFieldOptions } from './field';
import * as validators from '../validation/validators';
import { IModelManager } from '../models/types';
import { isSet } from '../utils';

export interface IRelatedModelFieldOptions extends IFieldOptions {
    model: string;
}

export const DEFAULT_MODELLIST_FIELD_OPTIONS: IFieldOptions = {
    required: false
};

export class RelatedModelFieldBase extends Field {}

export class RelatedModelField extends RelatedModelFieldBase {
    options: IRelatedModelFieldOptions;

    constructor(
            name: string,
            options: IRelatedModelFieldOptions) {
        super(name, options);

        if (!options.model || typeof options.model != 'string') {
            throw new Error('RelatedModelField Error: options.model must be a non-empty string');
        }

        this.validators.push(validators.modelClassValidator);
        this.validators.push(validators.modelPrimaryKeyValidator);

    }

    toBackendValue(manager: IModelManager, field: Field, value: any): any {
        if (!isSet(value)) {
            return null;
        }
        const meta = manager.getModelMeta(field.options.model);
        if (!meta.primaryKey || meta.primaryKey.length == 0) {
            return null;  // Should not be hit due to primary key validator
        }
        if (meta.primaryKey.length == 1) {
            return value[meta.primaryKey[0]] || null;
        }
        else {
            const pkValue = meta.primaryKey.map((keyField) => value[keyField]);
            return JSON.stringify(pkValue);
        }
    }
}

export class RelatedModelListField extends RelatedModelFieldBase {
    options: IRelatedModelFieldOptions;

    constructor(
            name: string,
            options: IRelatedModelFieldOptions) {

        // RecordListFields should not be required by default
        const opts = Object.assign({}, DEFAULT_MODELLIST_FIELD_OPTIONS, options);

        super(name, opts);

        if (!options.model || typeof options.model != 'string') {
            throw new Error('RelatedModelListField Error: options.model must be a non-empty string');
        }

        this.validators.push(validators.modelListClassValidator);

    }

    toBackendValue(manager: IModelManager, field: Field, value: any): any {
        // Cannot currently be stored
    }
}
