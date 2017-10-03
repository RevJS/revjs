
import { fields } from 'rev-models';
import { ModelApiManager } from '../api/manager';
import { STANDARD_OPERATIONS } from 'rev-models/lib/operations';

export interface IApiMethodMeta {
    args?: fields.Field[];
    validateModel?: boolean;
}

export interface IApiMeta {
    model: string;
    operations?: string[];
    methods?: Array<string | IApiMethodMeta>;
}

export function checkApiMeta(
        apiManager: ModelApiManager,
        apiMeta: IApiMeta) {

    // Check API Metadata
    if (!apiMeta || !apiMeta.model) {
        throw new Error(`ApiMetadataError: API metadata must include the 'model' key.`);
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
        if (!(apiMeta.methods instanceof Array)) {
            throw new Error(`ApiMetadataError: API metadata 'methods' must be an array.`);
        }
    }

    // Check if model already registered
    if (apiManager.isRegistered(apiMeta.model)) {
        throw new Error(`ApiManagerError: Model '${apiMeta.model}' already has a registered API.`);
    }

    // Load model metadata
    let modelMeta = apiManager.modelManager.getModelMeta(apiMeta.model);

    // Configure API methods
    for (const methodEntry in apiMeta.methods) {
        let method: IApiMethodMeta;
        if (typeof methodEntry == 'string') {
            method = {
                name: methodEntry
            };
        }
        else {
            method = methodEntry;
        }

        if (!method || typeof method != 'object' || !method.name) {
            throw new Error('ApiMetadataError: Invalid method definition found.');
        }

        if (typeof modelMeta.ctor.prototype[method.name] != 'function') {
            throw new Error(`ApiMetadataError: ${modelMeta.name}.${method.name} is not a function.`);
        }

        if (method.args) {
            if (!(method.args instanceof Array)) {
                throw new Error('ApiMetadataError: Method args property must be an array of Field objects.');
            }
            for (let arg of method.args) {
                if (!(arg instanceof fields.Field)) {
                    throw new Error('ApiMetadataError: API method args must be an instance of Field.');
                }
            }
        }
    }
}
