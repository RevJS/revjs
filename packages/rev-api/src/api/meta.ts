
import { fields, IModel } from 'rev-models';
import { ModelApiManager } from '../api/manager';
import { STANDARD_OPERATIONS } from 'rev-models/lib/operations';

const RESERVED_ARG_NAMES = ['model'];

export interface IApiMethodMeta {
    args?: fields.Field[];
    validateModel?: boolean;
}

export interface IApiMeta {
    model?: string;
    operations?: string[];
    methods?: {
        [methodName: string]: IApiMethodMeta;
    };
}

export function initialiseApiMeta<T extends IModel>(
        apiManager: ModelApiManager,
        model: T,
        apiMeta: IApiMeta) {

    // Check API Metadata
    if (!apiMeta) { apiMeta = {}; }
    if (!apiMeta.operations) { apiMeta.operations = []; }
    if (!apiMeta.methods) { apiMeta.methods = {}; }

    let proto = model.prototype;
    if (proto.__apiOperations) {
        apiMeta.operations.push.apply(apiMeta.operations, proto.__apiOperations);
    }
    if (proto.__apiMethods) {
        Object.assign(apiMeta.methods, proto.__apiMethods);
    }

    apiMeta.model = apiMeta.model || model.name;

    // Check if model is registered
    if (!apiManager.modelManager.isRegistered(apiMeta.model)) {
        throw new Error(`ApiManagerError: Model '${apiMeta.model}' is not registered with the model manager.`);
    }

    // Check if model API already registered
    if (apiManager.isRegistered(apiMeta.model)) {
        throw new Error(`ApiManagerError: Model '${apiMeta.model}' already has a registered API.`);
    }

    if (apiMeta.operations) {
        if (!(apiMeta.operations instanceof Array)) {
            throw new Error(`ApiMetadataError: API metadata 'operations' must be an array.`);
        }
        for (let opName of apiMeta.operations) {
            if (STANDARD_OPERATIONS.indexOf(opName) == -1) {
                throw new Error(`ApiMetadataError: Invalid operation name '${opName}'.`);
            }
        }
    }

    if (apiMeta.methods) {
        if (typeof apiMeta.methods != 'object') {
            throw new Error(`ApiMetadataError: API metadata 'methods' must be an object.`);
        }
    }

    // Configure API methods
    for (const methodName of Object.keys(apiMeta.methods)) {

        if (STANDARD_OPERATIONS.indexOf(methodName) > -1) {
            throw new Error(`ApiMetadataError: API method name '${methodName}' is a reserved name.`);
        }

        let methodMeta = apiMeta.methods[methodName];

        if (!methodMeta || typeof methodMeta != 'object') {
            throw new Error('ApiMetadataError: Invalid method definition found.');
        }

        if (typeof model.prototype[methodName] != 'function') {
            throw new Error(`ApiMetadataError: ${apiMeta.model}.${methodName} is not a function.`);
        }

        if (methodMeta.args) {
            if (!(methodMeta.args instanceof Array)) {
                throw new Error('ApiMetadataError: Method args property must be an array of Field objects.');
            }
            for (let arg of methodMeta.args) {
                if (!(arg instanceof fields.Field)) {
                    throw new Error('ApiMetadataError: API method args must be an instance of Field.');
                }
                else if (RESERVED_ARG_NAMES.indexOf(arg.name) > -1) {
                    throw new Error(`ApiMetadataError: API method arg name '${arg.name}' is reserved.`);
                }
            }
        }
    }

    if (apiMeta.operations.length == 0
        && Object.keys(apiMeta.methods).length == 0) {
            throw new Error(`ApiMetadataError: No operations or methods defined for ${apiMeta.model}.`);
    }

    return apiMeta;
}
