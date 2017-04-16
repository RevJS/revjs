import { IModelOperation } from './operation';
import { ModelValidationResult } from '../validation/validationresult';
import { Model } from '../models/model';

export interface IOperationError {
    message: string;
    code?: string;
    [key: string]: any;
}

export interface IModelOperationResult<T extends Model> {
    operation: IModelOperation;
    success: boolean;
    validation?: ModelValidationResult;
    result?: T;
    results?: T[];
    errors?: IOperationError[];
}

export class ModelOperationResult<T extends Model> implements IModelOperationResult<T> {
    operation: IModelOperation;
    success: boolean;
    validation?: ModelValidationResult;
    result?: T;
    results?: T[];
    errors?: IOperationError[];

    constructor(operation: IModelOperation) {
        this.operation = operation;
        this.success = true;
    }

    addError(message: string, code?: string, data?: any) {
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

    createValidationError(validationResult: ModelValidationResult): Error {
        this.validation = validationResult;
        this.addError('Model failed validation', 'validation_error');
        let err = new Error('ValidationError');
        err.result = this;
        return err;
    }
}
