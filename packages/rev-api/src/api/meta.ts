
import { IModel } from 'rev-models';
import { fields } from 'rev-models';
import { IApiMethod } from './method';
import { IApiDefinition } from './definition';
import { ModelApiManager } from '../api/manager';
import { STANDARD_OPERATIONS } from 'rev-models/lib/operations';

export interface IApiMeta {
    operations: string[];
    methods: {
        [name: string]: IApiMethod;
    };
}

export function initialiseApiMeta<T extends IModel>(
        apiManager: ModelApiManager,
        apiMeta: IApiDefinition<T>): IApiMeta {

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
    else {
        apiMeta.operations = [];
    }

    if (apiMeta.methods) {
        if (typeof apiMeta.methods != 'object') {
            throw new Error(`ApiMetadataError: API metadata 'methods' must be an object.`);
        }
    }
    else {
        apiMeta.methods = {};
    }

    // Load model metadata
    let modelMeta = apiManager.modelManager.getModelMeta(apiMeta.model);
    if (apiManager.isRegistered(modelMeta.name)) {
        throw new Error(`ApiManagerError: Model '${modelMeta.name}' already has a registered API.`);
    }

    // Configure API methods
    for (const methodName in apiMeta.methods) {
        const method = apiMeta.methods[methodName];
        if (!method || typeof method != 'object') {
            throw new Error(`ApiMetadataError: Invalid method definition for '${methodName}'.`);
        }
        if (!method.args || !method.handler
                || typeof method.args != 'object' || !(method.args instanceof Array)
                || typeof method.handler != 'function') {
            throw new Error('ApiMetadataError: Custom API methods must define an args array and a handler function');
        }
        // Check and convert method args to an array of Fields
        for (let i = 0; i < method.args.length; i++) {
            let arg = method.args[i];
            if (typeof arg == 'string') {
                if (!(arg in modelMeta.fieldsByName)) {
                    throw new Error(`ApiMetadataError: Field '${arg}' does not exist in model '${modelMeta.name}'.`);
                }
                else {
                    method.args[i] = modelMeta.fieldsByName[arg];
                }
            }
            else if (!(arg instanceof fields.Field)) {
                throw new Error('ApiMetadataError: API method args must either be an instance of a Field or a string matching a field on the corresponding model.');
            }
        }
    }

    return apiMeta as IApiMeta;
}
