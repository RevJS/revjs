
import { IModel, IModelMeta, checkIsModelConstructor } from '../model';

export class ModelRegistry {

    private _modelProto: { [modelName: string]: Function };
    private _modelMeta: { [modelName: string]: IModelMeta };

    constructor() {
        this._modelProto = {};
        this._modelMeta = {};
    }

    public register(model: Function, meta: IModelMeta) {
        // Check model constructor
        checkIsModelConstructor(model);
        let modelName = model.name;
        if (modelName in this._modelProto) {
            throw new Error('Model \'${modelName}\' already exists in the registry.');
        }

        // Check metadata
        if (!meta.fields || !(meta.fields instanceof Array)) {
            throw new Error('You have not defined the fields metadata for this model.');
        }

        // Populate default metadata
        if (meta.name) {
            if (modelName != meta.name) {
                throw new Error('Model name does not match meta name. To register the model under a different name you should rename its constructor.');
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

    public getProto(modelName: string) {
        if (!(modelName in this._modelProto)) {
            throw new Error('Model  \'${modelName}\' does not exist in the registry.');
        }
        return this._modelProto[modelName];
    }

    public getMeta(modelName: string) {
        if (!(modelName in this._modelMeta)) {
            throw new Error('Model  \'${modelName}\' does not exist in the registry.');
        }
        return this._modelMeta[modelName];
    }
}

export let registry = new ModelRegistry();

export function register(model: Function, meta: IModelMeta) {
    registry.register(model, meta);
}
