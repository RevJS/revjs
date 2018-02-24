import { IModelOperation } from './operation';
import { ModelValidationResult } from '../validation/validationresult';

export interface IOperationError {
    message: string;
    code?: string;
    [key: string]: any;
}

export interface IOperationMeta {
    // Base interface for operation result metadata
    // In future we might have common meta, e.g. exec_time
}

export interface IModelOperationResult<T, M extends IOperationMeta> {
    operation: IModelOperation;
    success: boolean;
    validation?: ModelValidationResult;
    result?: T;
    results?: T[];
    errors?: IOperationError[];
    meta?: M;
}

export class ModelOperationResult<T, M extends IOperationMeta> implements IModelOperationResult<T, M> {
    operation: IModelOperation;
    success: boolean;
    validation?: ModelValidationResult;
    result?: T;
    results?: T[];
    errors?: IOperationError[];
    meta?: M;

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

    setMeta(meta: Partial<M>) {
        if (typeof meta != 'object') {
            throw new Error('metadata must be an object');
        }
        if (!this.meta) {
            this.meta = {} as any;
        }
        Object.assign(this.meta, meta);
    }

}
