
import { IModel, IModelMeta } from 'rev-models/lib/models';
import { checkMetadataInitialised } from 'rev-models/lib/models/utils';
import * as fields from 'rev-models/lib/fields';

export interface IApiMethodContext {
    TODO_add_useful_context: string;
}

export interface IApiMethod {
    args: Array<fields.Field | string>;
    handler: (context: IApiMethodContext, ...args: any[]) => Promise<any>;
}

export interface IApiMeta {
    operations: string[] | 'all';
    methods?: {
        [name: string]: IApiMethod;
    };
}

let modelOps = ['create', 'read', 'update', 'remove'];

export function initialiseApiMeta<T extends IModel>(modelMeta: IModelMeta<T>, apiMeta: IApiMeta) {

    checkMetadataInitialised(modelMeta);

    // Check and update apiMeta.operations
    if (!apiMeta || !apiMeta.operations
            || (!(apiMeta.operations instanceof Array)
                && apiMeta.operations != 'all')) {
        throw new Error('ApiMetadataError: API metadata must contain a valid "operations" entry.');
    }
    if (apiMeta.operations == 'all') {
        apiMeta.operations = modelOps.map((op) => op);
    }
    else {
        for (let op of apiMeta.operations) {
            if (!op || typeof op != 'string' || modelOps.indexOf(op) < 0) {
                throw new Error(`ApiMetadataError: Invalid operation in operations list: '${op}'.`);
            }
        }
    }

    // Check and update apiMeta.methods
    if (apiMeta.methods) {
        for (const methodName in apiMeta.methods) {
            const method = apiMeta.methods[methodName];

            if (typeof method != 'object'
                    || !method.args || !method.handler
                    || typeof method.args != 'object' || !(method.args instanceof Array)
                    || typeof method.handler != 'function') {
                throw new Error('ApiMetadataError: API methods must define an args array and a handler function');
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
    }

}
