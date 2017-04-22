
import { initialiseMeta, IModelMeta } from '../models/meta';
import { Model } from '../models/model';
import { checkIsModelConstructor } from '../models/utils';
import { IBackend } from '../backends/backend';

export class ModelRegistry {

    _models: { [modelName: string]: IModelMeta<any> };
    _backends: { [backendName: string]: IBackend };

    constructor() {
        this._models = {};
        this._backends = {};
    }

    // TODO: Support extending existing models

    isRegistered(modelName: string): boolean {
        return (modelName in this._models);
    }

    register<T extends Model>(model: new(...args: any[]) => T, meta?: IModelMeta<T>) {

        // Check model constructor
        checkIsModelConstructor(model);
        let modelName = model.name;
        if (this.isRegistered(modelName)) {
            throw new Error(`RegistryError: Model '${modelName}' already exists in the registry.`);
        }

        // Initialise model metadata
        let modelMeta = initialiseMeta(this, model, meta);

        // Add prototype and metadata to the registry
        this._models[modelName] = modelMeta;
    }

    getModelNames(): string[] {
        return Object.keys(this._models);
    }

    getModelMeta(modelName: string) {
        if (!this.isRegistered(modelName)) {
            throw new Error(`RegistryError: Model  '${modelName}' does not exist in the registry.`);
        }
        return this._models[modelName];
    }

    isBackendRegistered(backendName: string): boolean {
        return (backendName in this._backends);
    }

    registerBackend(backendName: string, backend: IBackend) {
        if (!backendName) {
            throw new Error('RegistryError: you must specify a name for the backend.');
        }
        if (!backend || typeof backend != 'object') {
            throw new Error('RegistryError: you must pass an instance of a backend class.');
        }
        if (typeof backend.create != 'function' || typeof backend.update != 'function'
            || typeof backend.read != 'function' || typeof backend.remove != 'function') {
            throw new Error('RegistryError: the specified backend does not fully implement the IBackend interface.');
        }
        this._backends[backendName] = backend;
    }

    getBackend(backendName: string): IBackend {
        if (!backendName) {
            throw new Error('RegistryError: you must specify the name of the backend to get.');
        }
        if (!(backendName in this._backends)) {
            throw new Error(`RegistryError: Backend '${backendName}' has has not been configured.`);
        }
        return this._backends[backendName];
    }

    getBackendNames(): string[] {
        return Object.keys(this._backends);
    }

    clearRegistry() {
        this._models = {};
        this._backends = {};
    }
}
