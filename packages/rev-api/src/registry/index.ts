
import { IModel, checkIsModelConstructor } from 'rev-models/lib/models';
import { IApiMeta, initialiseApiMeta } from '../api/meta';

import { ModelRegistry, registry as revRegistry } from 'rev-models/lib/registry';

export class ModelApiRegistry {

    private _modelRegistry: ModelRegistry;
    private _apiMeta: {
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

    public getModelRegistry() {
        return this._modelRegistry;
    }

    public isRegistered(modelName: string) {
        return (modelName && (modelName in this._apiMeta));
    }

    public register<T extends IModel>(model: new() => T, apiMeta: IApiMeta) {

        // Check model constructor
        checkIsModelConstructor(model);
        let modelName = model.name;
        if (!this._modelRegistry.isRegistered(modelName)) {
            throw new Error(`ApiRegistryError: Model '${modelName}' has not been registered.`);
        }
        if (this.isRegistered(modelName)) {
            throw new Error(`ApiRegistryError: Model '${modelName}' already has a registered API.`);
        }

        // Check api meta
        let modelMeta = this._modelRegistry.getMeta(modelName);
        initialiseApiMeta(modelMeta, apiMeta);

        // Add api meta to the registry
        this._apiMeta[modelName] = apiMeta;
    }

    public getApiMeta(modelName: string): IApiMeta {
        if (!(modelName in this._apiMeta)) {
            throw new Error(`ApiRegistryError: Model '${modelName}' does not have a registered API.`);
        }
        return this._apiMeta[modelName];
    }

    public clearRegistry() {
        this._apiMeta = {};
    }
}

export const registry = new ModelApiRegistry();

export function register<T extends IModel>(model: new() => T, apiMeta: IApiMeta) {
    registry.register(model, apiMeta);
}
