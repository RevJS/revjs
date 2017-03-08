
import { IModel, IModelMeta, ModelOperationType } from 'rev-models/lib/models';
import { checkMetadataInitialised } from 'rev-models/lib/models/utils';
import { fields } from 'rev-models';

export interface IApiMethodContext {
    TODO_add_useful_context: string;
}

export interface IApiMethod {
    name: string;
    args: Array<fields.Field | string>;
    handler: (context: IApiMethodContext, ...args: any[]) => Promise<any>;
}

export interface IApiMeta {
    operations: ModelOperationType[] | 'all';
    methods?: IApiMethod[];
}

export function initialiseApiMeta<T extends IModel>(modelMeta: IModelMeta<T>, apiMeta: IApiMeta) {

    checkMetadataInitialised(modelMeta);

    if (!apiMeta || !apiMeta.operations
            || (!(apiMeta.operations instanceof Array)
                && apiMeta.operations != 'all')) {
        throw new Error('ApiMetadataError: API metadata must contain a valid "operations" entry.');
    }

    let opOps: ModelOperationType[] = ['create', 'read', 'update', 'remove'];
    if (apiMeta.operations == 'all') {
        apiMeta.operations = opOps.map((op) => op);
    }
    else {
        for (let op of apiMeta.operations) {
            if (!op || typeof op != 'string' || opOps.indexOf(op) < 0) {
                throw new Error(`ApiMetadataError: Invalid operation in operations list: '${op}'.`);
            }
        }
    }

}
