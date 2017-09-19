
import { ModelManager, IModel } from 'rev-models';
import { IApiMeta, initialiseApiMeta } from '../api/meta';
import { getGraphQLSchema } from '../graphql/schema';
import { GraphQLSchema } from 'graphql';

import { IApiDefinition } from '../api/definition';

export class ModelApiManager {

    modelManager: ModelManager;
    _apiMeta: {
        [modelName: string]: IApiMeta
    };

    constructor(modelManager: ModelManager) {
        if (typeof modelManager != 'object' || !(modelManager instanceof ModelManager)) {
            throw new Error(`ApiManagerError: Invalid ModelManager passed in constructor.`);
        }
        this.modelManager = modelManager;
        this._apiMeta = {};
    }

    getModelManager() {
        return this.modelManager;
    }

    isRegistered(modelName: string) {
        return (modelName && (modelName in this._apiMeta));
    }

    register<T extends IModel>(apiDefinition: IApiDefinition<T>) {
        // Add api meta to the registry if valid
        let apiMeta = initialiseApiMeta(this, apiDefinition);
        this._apiMeta[apiDefinition.model.name] = apiMeta;
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
        return getGraphQLSchema(this);
    }

    clearManager() {
        this._apiMeta = {};
    }
}
