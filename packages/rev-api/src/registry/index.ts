
import { IModel, checkIsModelConstructor } from 'rev-models/lib/models';
import { IApiMeta, initialiseApiMeta, IApiMetaDefinition } from '../api/meta';
import { getGraphQLSchema } from '../graphql/schema';
import { GraphQLSchema } from 'graphql';

import { ModelRegistry, registry as revRegistry } from 'rev-models/lib/registry';

export class ModelApiRegistry {

    _modelRegistry: ModelRegistry;
    _apiMeta: {
        [modelName: string]: IApiMeta
    };

    constructor(modelRegistry?: ModelRegistry) {
        if (modelRegistry) {
            if (typeof modelRegistry != 'object' || !(modelRegistry instanceof ModelRegistry)) {
                throw new Error(`ApiRegistryError: Invalid ModelRegistry passed in constructor.`);
            }
            this._modelRegistry = modelRegistry;
        }
        else {
            this._modelRegistry = revRegistry;
        }
        this._apiMeta = {};
    }

    getModelRegistry() {
        return this._modelRegistry;
    }

    isRegistered(modelName: string) {
        return (modelName && (modelName in this._apiMeta));
    }

    register<T extends IModel>(model: new() => T, apiMeta: IApiMetaDefinition) {

        // Check model constructor
        checkIsModelConstructor(model);
        let modelName = model.name;
        if (!this._modelRegistry.isRegistered(modelName)) {
            throw new Error(`ApiRegistryError: Model '${modelName}' has not been registered.`);
        }
        if (this.isRegistered(modelName)) {
            throw new Error(`ApiRegistryError: Model '${modelName}' already has a registered API.`);
        }

        // Load model metadata
        let modelMeta = this._modelRegistry.getMeta(modelName);

        // Add api meta to the registry
        this._apiMeta[modelName] = initialiseApiMeta(modelMeta, apiMeta);
    }

    getModelNames(operation?: string): string[] {
        return Object.keys(this._apiMeta);
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

export const registry = new ModelApiRegistry();

export function register<T extends IModel>(model: new() => T, apiMeta: IApiMeta) {
    registry.register(model, apiMeta);
}
