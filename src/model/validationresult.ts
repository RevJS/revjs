
export interface IFieldError {
    message: string;
    [key: string]: any;
}

export interface IModelError {
    message: string;
    [key: string]: any;
}

export class ModelValidationResult {
    public valid: boolean;
    public fieldErrors: {
        [fieldName: string]: IFieldError[]
    };
    public modelErrors: IModelError[];

    constructor(valid?: boolean) {
        if (typeof valid == 'undefined') {
            this.valid = true;
        }
        else {
            if (typeof valid != 'boolean') {
                throw new Error('ValidationError: First argument to the ValidationResult constructor must be a boolean.')
            }
            this.valid = valid;
        }
        this.fieldErrors = {};
        this.modelErrors = [];
    }

    public addFieldError(fieldName: string, message?: string, data?: Object) {
        if (!fieldName) {
            throw new Error(`ValidationError: You must specify fieldName when adding a field error.`);
        }
        this.valid = false;
        if (!(fieldName in this.fieldErrors)) {
            this.fieldErrors[fieldName] = [];
        }
        let fieldError = {
            message: message
        };
        if (data) {
            if (typeof data != 'object') {
                throw new Error(`ValidationError: You cannot add non-object data to a validation error (field: "${fieldName}").`);
            }
            Object.assign(fieldError, data);
        }
        this.fieldErrors[fieldName].push(fieldError);
    }

    public addModelError(message: string, data?: Object) {
        if (!message) {
            throw new Error(`ValidationError: You must specify a message for a model error.`);
        }
        this.valid = false;
        let modelError = {
            message: message
        };
        if (data) {
            if (typeof data != 'object') {
                throw new Error(`ValidationError: You cannot add non-object data to a model validation error.`);
            }
            Object.assign(modelError, data);
        }
        this.modelErrors.push(modelError);
    }
}
