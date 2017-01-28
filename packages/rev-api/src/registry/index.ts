
import { IModel, checkIsModelConstructor } from 'rev-models/models';
import { IApiMeta, checkApiMeta } from '../api/meta';

import { registry as modelRegistry } from 'rev-models/registry';

export class ModelApiRegistry {

    private _apiMeta: {
        [modelName: string]: IApiMeta
    };

    constructor() {
        this._apiMeta = {};
    }

    public isRegistered(modelName: string) {
        return (modelName && (modelName in this._apiMeta));
    }

    public register<T extends IModel>(model: new() => T, apiMeta: IApiMeta) {

        // Check model constructor
        checkIsModelConstructor(model);
        let modelName = model.name;
        if (!modelRegistry.isRegistered(modelName)) {
            throw new Error(`APIRegistryError: Model '${modelName}' has not been registered.`);
        }
        if (this.isRegistered(modelName)) {
            throw new Error(`APIRegistryError: Model '${modelName}' already has a registered API.`);
        }

        // Check api meta
        let modelMeta = modelRegistry.getMeta(modelName);
        checkApiMeta(modelMeta, apiMeta);

        // Add api meta to the registry
        this._apiMeta[modelName] = apiMeta;
    }

    public getApiMeta(modelName: string): IApiMeta {
        if (!(modelName in this._apiMeta)) {
            throw new Error(`APIRegistryError: Model '${modelName}' does not have a registered API.`);
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
