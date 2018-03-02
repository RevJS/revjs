
export interface IFieldError {
    message: string;
    code?: string;
    [key: string]: any;
}

export interface IModelError {
    message: string;
    code?: string;
    [key: string]: any;
}

/**
 * Represents the result of validation of model data
 */
export interface IModelValidationResult {
    /**
     * Indicates whether the model data has passed validation
     */
    valid: boolean;
    /**
     * Details of any validation errors that occured, organised by field name.
     */
    fieldErrors: {
        [fieldName: string]: IFieldError[]
    };
    /**
     * A list of any validation errors that occured at the model-level.
     */
    modelErrors: IModelError[];
}

/**
 * This is the implementation of [[IModelValidationResult]], which is
 * created by the [[ModelManager.validate]] method and is passed down to field
 * and model validation functions. It includes utility methods to update the
 * result such as **addFieldError()** and **addModelError()**
 */
export class ModelValidationResult implements IModelValidationResult {
    valid: boolean;
    fieldErrors: {
        [fieldName: string]: IFieldError[]
    };
    modelErrors: IModelError[];

    constructor(valid?: boolean) {
        if (typeof valid == 'undefined') {
            this.valid = true;
        }
        else {
            if (typeof valid != 'boolean') {
                throw new Error('ValidationError: First argument to the ValidationResult constructor must be a boolean.');
            }
            this.valid = valid;
        }
        this.fieldErrors = {};
        this.modelErrors = [];
    }

    /**
     * Marks `result.valid = false` and adds the passed error details into
     * `result.fieldErrors`
     * @param fieldName The name of the field with the validation error
     * @param message The user-friendly validation error message
     * @param code A code that can be used by calling methods to identify the type of error
     * @param data Any additional data to return with the error
     */
    addFieldError(fieldName: string, message: string, code?: string, data?: any) {
        if (!fieldName) {
            throw new Error(`ValidationError: You must specify fieldName when adding a field error.`);
        }
        this.valid = false;
        if (!(fieldName in this.fieldErrors)) {
            this.fieldErrors[fieldName] = [];
        }
        let fieldError: IFieldError = {
            message: message
        };
        if (code) {
            fieldError.code = code;
        }
        if (data) {
            if (typeof data != 'object') {
                throw new Error(`ValidationError: You cannot add non-object data to a validation error (field: "${fieldName}").`);
            }
            Object.assign(fieldError, data);
        }
        this.fieldErrors[fieldName].push(fieldError);
    }

    /**
     * Marks `result.valid = false` and adds the passed error details into
     * `result.modelErrors`
     * @param message The user-friendly validation error message
     * @param code A code that can be used by calling methods to identify the type of error
     * @param data Any additional data to return with the error
     */
    addModelError(message: string, code?: string, data?: any) {
        if (!message) {
            throw new Error(`ValidationError: You must specify a message for a model error.`);
        }
        this.valid = false;
        let modelError: IModelError = {
            message: message
        };
        if (code) {
            modelError.code = code;
        }
        if (data) {
            if (typeof data != 'object') {
                throw new Error(`ValidationError: You cannot add non-object data to a model validation error.`);
            }
            Object.assign(modelError, data);
        }
        this.modelErrors.push(modelError);
    }
}
