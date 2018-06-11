
import { IModelManager, IModel } from 'rev-models';
import { checkIsValidModelConstructor } from 'rev-models/lib/models/utils';
import { initialiseApiMeta } from '../api/meta';
import { IModelApiManager, IApiMeta } from './types';
import { GraphQLApi } from '../graphql/api';
import { GraphQLSchema } from 'graphql/type/schema';

export class ModelApiManager implements IModelApiManager {

    modelManager: IModelManager;
    _apiMeta: {
        [modelName: string]: IApiMeta
    };

    constructor(modelManager: IModelManager) {
        if (!modelManager || typeof modelManager.getModelMeta != 'function') {
            throw new Error(`ApiManagerError: Invalid ModelManager passed in constructor.`);
        }
        this.modelManager = modelManager;
        this._apiMeta = {};
    }

    getModelManager() {
        return this.modelManager;
    }

    isRegistered(modelName: string) {
        return modelName ? modelName in this._apiMeta : false;
    }

    register<T extends IModel>(model: new(...args: any[]) => T, apiMeta?: Partial<IApiMeta>) {
        // Add api meta to the registry if valid
        checkIsValidModelConstructor(model);
        const meta = initialiseApiMeta(this, model, apiMeta);
        this._apiMeta[meta.model] = meta;
    }

    getModelNames(): string[] {
        return Object.keys(this._apiMeta);
    }

    getModelNamesByOperation(operationName: string): string[] {
        let matches: string[] = [];
        for (let modelName in this._apiMeta) {
            if (this._apiMeta[modelName].operations.indexOf(operationName) > -1) {
                matches.push(modelName);
            }
        }
        return matches;
    }

    getApiMeta(modelName: string): IApiMeta {
        if (!(modelName in this._apiMeta)) {
            throw new Error(`ApiManagerError: Model '${modelName}' does not have a registered API.`);
        }
        return this._apiMeta[modelName];
    }

    getGraphQLSchema(): GraphQLSchema {
        return new GraphQLApi(this).getSchema();
    }

    clearManager() {
        this._apiMeta = {};
    }
}
