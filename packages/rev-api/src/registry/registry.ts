
import { ModelRegistry, Model } from 'rev-models';
import { IApiMeta, initialiseApiMeta } from '../api/meta';
import { getGraphQLSchema } from '../graphql/schema';
import { GraphQLSchema } from 'graphql';

import { IApiDefinition } from '../api/definition';

export class ModelApiRegistry {

    modelRegistry: ModelRegistry;
    _apiMeta: {
        [modelName: string]: IApiMeta
    };

    constructor(modelRegistry: ModelRegistry) {
        if (typeof modelRegistry != 'object' || !(modelRegistry instanceof ModelRegistry)) {
            throw new Error(`ApiRegistryError: Invalid ModelRegistry passed in constructor.`);
        }
        this.modelRegistry = modelRegistry;
        this._apiMeta = {};
    }

    getModelRegistry() {
        return this.modelRegistry;
    }

    isRegistered(modelName: string) {
        return (modelName && (modelName in this._apiMeta));
    }

    register<T extends Model>(apiDefinition: IApiDefinition<T>) {
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
            throw new Error(`ApiRegistryError: Model '${modelName}' does not have a registered API.`);
        }
        return this._apiMeta[modelName];
    }

    getGraphQLSchema(): GraphQLSchema {
        return getGraphQLSchema(this);
    }

    clearRegistry() {
        this._apiMeta = {};
    }
}
