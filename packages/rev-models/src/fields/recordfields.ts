
import { Field, IFieldOptions } from './field';
import * as validators from '../validation/validators';
import { IModelManager } from '../models/types';
import { isSet } from '../utils';

export interface IRecordFieldOptions extends IFieldOptions {
    model: string;
}

export const DEFAULT_RECORDLIST_FIELD_OPTIONS: IFieldOptions = {
    required: false
};

export class RecordField extends Field {
    options: IRecordFieldOptions;

    constructor(
            name: string,
            options: IRecordFieldOptions) {
        super(name, options);

        if (!options.model || typeof options.model != 'string') {
            throw new Error('RecordFieldError: options.model must be a non-empty string');
        }

        this.validators.push(validators.recordClassValidator);
        this.validators.push(validators.recordPrimaryKeyValidator);

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

export class RecordListField extends Field {
    options: IRecordFieldOptions;

    constructor(
            name: string,
            options: IRecordFieldOptions) {

        // RecordListFields should not be required by default
        const opts = Object.assign({}, DEFAULT_RECORDLIST_FIELD_OPTIONS, options);

        super(name, opts);

        if (!options.model || typeof options.model != 'string') {
            throw new Error('RecordFieldError: options.model must be a non-empty string');
        }

        this.validators.push(validators.recordListClassValidator);

    }

    toBackendValue(manager: IModelManager, field: Field, value: any): any {
        // Cannot currently be stored
    }
}
