
import { IModelMeta, initialiseMeta } from '../model/meta';
import { IModel, checkIsModelConstructor } from '../model';

export class ModelRegistry {

    private _modelProto: { [modelName: string]: Function };
    private _modelMeta: { [modelName: string]: IModelMeta<IModel> };

    constructor() {
        this._modelProto = {};
        this._modelMeta = {};
    }

    // TODO: Support extending existing models

    public register<T extends IModel>(model: new() => T, meta: IModelMeta<T>) {

        // Check model constructor
        checkIsModelConstructor(model);
        let modelName = model.name;
        if (modelName in this._modelProto) {
            throw new Error(`RegistryError: Model '${modelName}' already exists in the registry.`);
        }

        // Initialise model metadata
        initialiseMeta(model, meta);

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

    public clearRegistry() {
        this._modelProto = {};
        this._modelMeta = {};
    }
}

export const registry = new ModelRegistry();

export function register<T extends IModel>(model: new() => T, meta: IModelMeta<T>) {
    registry.register(model, meta);
}
