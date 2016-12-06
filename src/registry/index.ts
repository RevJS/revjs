import { Field } from './../fields/index';

import { IModel, IModelMeta, checkIsModelConstructor, checkIsModelMetadata } from '../model';

export class ModelRegistry {

    private _modelProto: { [modelName: string]: Function };
    private _modelMeta: { [modelName: string]: IModelMeta<IModel> };

    constructor() {
        this._modelProto = {};
        this._modelMeta = {};
    }

    public register(model: Function, meta: IModelMeta<IModel>) {
        // Check model constructor
        checkIsModelConstructor(model);
        let modelName = model.name;
        if (modelName in this._modelProto) {
            throw new Error(`RegistryError: Model '${modelName}' already exists in the registry.`);
        }

        // Check metadata
        checkIsModelMetadata(meta);

        // Populate default metadata
        if (meta.name) {
            if (modelName != meta.name) {
                throw new Error('RegistryError: Model name does not match meta.name. To register the model under a different name you should rename its constructor.');
            }
        }
        else {
            meta.name = modelName;
        }
        meta.storage = meta.storage ? meta.storage : 'default';
        meta.label = meta.label ? meta.label : meta.name;
        meta.singleton = meta.singleton ? true : false;

        // Add prototype and metadata to the registry
        this._modelProto[modelName] = model;
        this._modelMeta[modelName] = meta;
    }

    public getModelNames(): string[] {
        return Object.keys(this._modelMeta);
    }

    public getProto(modelName: string) {
        if (!(modelName in this._modelProto)) {
            throw new Error(`RegistryError: Model  '${modelName}' does not exist in the registry.`);
        }
        return this._modelProto[modelName];
    }

    public getMeta(modelName: string) {
        if (!(modelName in this._modelMeta)) {
            throw new Error(`RegistryError: Model  '${modelName}' does not exist in the registry.`);
        }
        return this._modelMeta[modelName];
    }
}

export const registry = new ModelRegistry();

export function register<T extends IModel>(model: new() => T, meta: IModelMeta<T>) {
    registry.register(model, meta);
}
