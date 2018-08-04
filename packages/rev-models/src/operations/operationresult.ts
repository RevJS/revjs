import { IModelOperation } from './operation';
import { ModelValidationResult, IModelValidationResult } from '../validation/validationresult';
import { IObject } from '../utils/types';

/**
 * @private
 */
export interface IOperationError {
    message: string;
    code?: string;
    [key: string]: any;
}

/**
 * @private
 */
export interface IOperationMeta {
    // Base interface for operation result metadata
    // In future we might have common meta, e.g. exec_time
}

/**
 * The IModelOperationResult interface is the standard data structure returned by
 * all RevJS model operations (create, update, etc.)
 *
 * @typeparam T The model class
 * @typeparam M The structure of the data returned in the 'meta' key
 */
export interface IModelOperationResult<T, M extends IOperationMeta> {
    /**
     * The name and other information about the current operation
     */
    operation: IModelOperation;
    /**
     * A boolean indicating whether the operation was successful or not
     */
    success: boolean;
    /**
     * The results of any model validation carried out
     */
    validation?: IModelValidationResult;
    /**
     * For operations that act on a sngle record (e.g. 'create'), the created/updated model
     */
    result?: T;
    /**
     * For operations that act on multiple models (e.g. 'read'), the list of associated models
     */
    results?: T[];
    /**
     * List of any errors that occured during the operation
     */
    errors?: IOperationError[];
    /**
     * Additional metadata related to the operation, e.g. "totalCount" - the number of records affected
     */
    meta: M;
}

/**
 * This is the internal implementation of [[IModelOperationResult]], which is created by a [[ModelManager]]
 * and passed down to [[IBackend]]s. It includes utility methods to update the result such as **addError()**
 * and **setMeta()**
 */
export class ModelOperationResult<T, M extends IOperationMeta> implements IModelOperationResult<T, M> {
    operation: IModelOperation;
    success: boolean;
    validation?: ModelValidationResult;
    result?: T;
    results?: T[];
    errors?: IOperationError[];
    meta: M;

    constructor(operation: IModelOperation) {
        this.operation = operation;
        this.success = true;
        this.meta = {} as any;
    }

    /**
     * Adds an error to the result
     * @param message The user-friendly error message
     * @param code A code that calling methods can use to identify the type of error
     * @param data Any additional data to pass back to calling methods
     */
    addError(message: string, code?: string, data?: IObject) {
        if (!message) {
            throw new Error(`ModelOperationResult Error: A message must be specified for the operation error.`);
        }
        this.success = false;
        let operationError: IOperationError = {
            message: message
        };
        if (code) {
            operationError.code = code;
        }
        if (data) {
            if (typeof data != 'object') {
                throw new Error(`ModelOperationResult Error: You cannot add non-object data to an operation result.`);
            }
            Object.assign(operationError, data);
        }
        if (!this.errors) {
            this.errors = [];
        }
        this.errors.push(operationError);
    }

    /**
     * Sets keys in the `result.meta` object, e.g. `totalCount`
     * @param meta An object containing the keys to set and their values
     */
    setMeta(meta: Partial<M>) {
        if (typeof meta != 'object') {
            throw new Error('metadata must be an object');
        }
        Object.assign(this.meta, meta);
    }

}
