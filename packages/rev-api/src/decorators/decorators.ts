import { IApiMethodMeta } from '../api/types';
import { STANDARD_OPERATIONS } from 'rev-models';

// ApiOperations class decorator

export function ApiOperations(operations: string[]) {

    if (!(operations instanceof Array)) {
        throw new Error('ApiOperations decorator must be passed an array of allowed operations.');
    }
    else {
        operations.forEach((op) => {
            if (STANDARD_OPERATIONS.indexOf(op) == -1) {
                throw new Error(`ApiOperations decorator error: '${op}' is not a supported operation.`);
            }
        });
    }

    return function(target: any) {
        Object.defineProperty(target.prototype, '__apiOperations', {
            enumerable: false, value: operations
        });
    };
}

// ApiMethod method decorator

function addApiMethod(target: any, methodName: string, meta: IApiMethodMeta) {

    if (typeof target[methodName] != 'function') {
        throw new Error(`ApiMethod decorator error: '${methodName}' is not a function.`);
    }

    if (!target.__apiMethods) {
        Object.defineProperty(target, '__apiMethods', {
            enumerable: false, value: {}
        });
    }
    target.__apiMethods[methodName] = meta || {};
}

export function ApiMethod(meta?: IApiMethodMeta)
{
    return function(target: any, propName: string) {
        addApiMethod(target, propName, meta);
    };
}
