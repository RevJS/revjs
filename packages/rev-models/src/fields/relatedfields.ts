
import { Field, IFieldOptions } from './field';
import * as validators from '../validation/validators';
import { IModelManager } from '../models/types';
import { isSet } from '../utils';

export interface IRelatedModelFieldOptions extends IFieldOptions {
    model: string;
}

export interface IRelatedModelListFieldOptions extends IFieldOptions {
    model: string;
    field: string;
}

/**
 * @private
 */
export const DEFAULT_MODELLIST_FIELD_OPTIONS: IFieldOptions = {
    required: false
};

/**
 * @private
 */
export class RelatedModelFieldBase extends Field {}

/**
 * A RelatedModelField is basically a "Foreign Key" link to a related model. Use
 * the **@RelatedModel()** decorator to add a RelatedModelField to your model
 *
 * **Accepted Values:** a JavaScript *object* representing an instance of the
 * related model
 *
 * ```ts
 * import { RelatedModel } from 'rev-models';
 *
 * class MyModel {
 *     @RelatedModel({ model: 'City' })
 *         city: City;
 * }
 * ```
 */
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

    toBackendValue(manager: IModelManager, value: any): any {
        if (!isSet(value)) {
            return null;
        }
        const meta = manager.getModelMeta(this.options.model);
        if (!meta.primaryKey) {
            return null;  // Should not be hit due to primary key validator
        }
        else {
            return value[meta.primaryKey] || null;
        }
    }
}

/**
 * A RelatedModelListField allows you easily retrieve all the related models
 * that are linked to the current model. Use the **@RelatedModelList()**
 * decorator to add a RelatedModelListField to your model
 *
 * **Note:** Currently RelatedModelListField lists are **read-only**. You can
 * link new models by updating their corresponding [[RelatedModelField]]
 *
 * ```ts
 * import { RelatedModelList } from 'rev-models';
 *
 * class City {
 *     @RelatedModelList({ model: 'Customer', field: 'city' })
 *         customers: Customer[];
 * }
 * ```
 */
export class RelatedModelListField extends RelatedModelFieldBase {
    options: IRelatedModelListFieldOptions;

    constructor(
            name: string,
            options: IRelatedModelListFieldOptions) {

        // RecordListFields should not be required by default
        const opts = Object.assign({}, DEFAULT_MODELLIST_FIELD_OPTIONS, options);

        super(name, opts);

        if (!options.model || typeof options.model != 'string') {
            throw new Error('RelatedModelListField Error: options.model must be a non-empty string');
        }
        if (!options.field || typeof options.field != 'string') {
            throw new Error('RelatedModelListField Error: options.field must be a non-empty string');
        }

        this.validators.push(validators.modelListClassValidator);

    }

    toBackendValue(manager: IModelManager, value: any): any {
        // Cannot currently be stored
    }
}
