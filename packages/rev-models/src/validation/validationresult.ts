
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

export class ModelValidationResult {
    valid: boolean;
    fieldErrors: {
        [fieldName: string]: IFieldError[]
    };
    modelErrors: IModelError[];
    validationFinished: boolean;

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
        this.validationFinished = true;
    }

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
