
import { Model } from 'rev-models';
import { IApiMeta, initialiseApiMeta, IApiMetaDefinition } from '../api/meta';
import { getGraphQLSchema } from '../graphql/schema';
import { GraphQLSchema } from 'graphql';

import { ModelRegistry } from 'rev-models';

export class ModelApiRegistry {

    _modelRegistry: ModelRegistry;
    _apiMeta: {
        [modelName: string]: IApiMeta
    };

    constructor(modelRegistry: ModelRegistry) {
        if (typeof modelRegistry != 'object' || !(modelRegistry instanceof ModelRegistry)) {
            throw new Error(`ApiRegistryError: Invalid ModelRegistry passed in constructor.`);
        }
        this._modelRegistry = modelRegistry;
        this._apiMeta = {};
    }

    getModelRegistry() {
        return this._modelRegistry;
    }

    isRegistered(modelName: string) {
        return (modelName && (modelName in this._apiMeta));
    }

    register<T extends Model>(model: new(...args: any[]) => T, apiMeta: IApiMetaDefinition) {

        // Load model metadata
        let modelMeta = this._modelRegistry.getModelMeta(model);

        if (this.isRegistered(modelMeta.name)) {
            throw new Error(`ApiRegistryError: Model '${modelMeta.name}' already has a registered API.`);
        }

        // Add api meta to the registry
        this._apiMeta[modelMeta.name] = initialiseApiMeta(modelMeta, apiMeta);
    }

    getModelNames(): string[] {
        return Object.keys(this._apiMeta);
    }

    getModelNamesByMethod(methodName: string): string[] {
        let matches: string[] = [];
        for (let modelName in this._apiMeta) {
            if (this._apiMeta[modelName].methods[methodName]) {
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
