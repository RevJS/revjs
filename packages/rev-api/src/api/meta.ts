import { IModel, IModelMeta, ModelOperationType } from 'rev-models/models';

export interface IApiMeta {
    operations: ModelOperationType[];
}

export function checkApiMeta<T extends IModel>(modelMeta: IModelMeta<T>, apiMeta: IApiMeta) {

    if (!apiMeta || !apiMeta.operations || !(apiMeta.operations instanceof Array)) {
        throw new Error('ApiMetadataError: API metadata must contain an "operations" array.');
    }

    let opOps: ModelOperationType[] = ['create','read','update','remove'];
    for (let op of apiMeta.operations) {
        if (!op || typeof op != 'string' || opOps.indexOf(op) < 0) {
            throw new Error(`ApiMetadataError: Invalid operation in operations list: '${op}'.`);
        }
    }

}
