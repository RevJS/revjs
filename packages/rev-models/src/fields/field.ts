import { isSet } from '../utils';

import * as validators from '../validation/validators';
import { IModel, IModelManager, IValidationOptions } from '../models/types';
import { IModelOperation } from '../operations/operation';
import { ModelValidationResult } from '../validation/validationresult';

/**
 * @private
 */
export interface IFieldOptions {
    label?: string;
    required?: boolean;
    primaryKey?: boolean;
    stored?: boolean;
}

/**
 * @private
 */
export const DEFAULT_FIELD_OPTIONS: IFieldOptions = {
    required: true,
    stored: true
};

/**
 * @private
 */
export function getOptions(options?: IFieldOptions): IFieldOptions {
    if (isSet(options)) {
        if (typeof options != 'object') {
            throw new Error('FieldError: the options parameter must be an object');
        }
        return Object.assign({}, DEFAULT_FIELD_OPTIONS, options);
    }
    else {
        return Object.assign({}, DEFAULT_FIELD_OPTIONS);
    }
}

/**
 * Base class for all RevJS Field Types
 */
export class Field {

    /**
     * Array of synchronous field validators, used when an instance of this field is validated.
     */
    validators: validators.IFieldValidator[];

    /**
     * Array of asynchronous field validators, used when an instance of this field is validated.
     */
    asyncValidators: validators.IAsyncFieldValidator[];

    constructor(public name: string, public options?: any) {
        if (!name || typeof name != 'string') {
            throw new Error('FieldError: new fields must have a name');
        }
        this.options = getOptions(options);
        this.validators = [];
        this.asyncValidators = [];
        if (this.options.required || typeof this.options.required == 'undefined') {
            this.validators.push(validators.requiredValidator);
        }
    }

    /**
     * @private
     * Used by ModelManager to validate a field value
     */
    validate<T extends IModel>(manager: IModelManager, model: T, operation: IModelOperation, result: ModelValidationResult, options?: IValidationOptions): Promise<ModelValidationResult> {
        let timeout = options && options.timeout ? options.timeout : 5000;
        return new Promise((resolve, reject) => {
            // Run synchronous validators
            for (let validator of this.validators) {
                validator(manager, model, this, operation, result, options);
            }
            // Run asynchronous validators
            if (this.asyncValidators.length > 0) {
                let promises: Array<Promise<void>> = [];
                for (let asyncValidator of this.asyncValidators) {
                    promises.push(asyncValidator(manager, model, this, operation, result, options));
                }
                Promise.all(promises)
                    .then(() => {
                        resolve(result);
                    });
                setTimeout(() => {
                    reject(new Error(`Field validate() - timed out after ${timeout} milliseconds`));
                }, timeout);
            }
            else {
                // Resolve immediately
                resolve(result);
            }
        });
    }

    /**
     * Convert a model instance value to a value for storing in a backend
     * @param manager The ModelManager associated with the model
     * @param value The value to convert
     * @returns The backend value
     */
    toBackendValue(manager: IModelManager, value: any) {
        return value;
    }

    /**
     * Convert a backend value into a model instance value
     * @param manager The ModelManager associated with the model
     * @param value The value to convert
     * @returns The value to be stored in the model instance
     */
    fromBackendValue(manager: IModelManager, value: any) {
        return value;
    }
}
