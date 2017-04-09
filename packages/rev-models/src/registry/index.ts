
import { initialiseMeta } from '../models/meta';
import { Model } from '../models/model';
import { checkIsModelConstructor } from '../models/utils';

export class ModelRegistry {

    _models: { [modelName: string]: new() => any };

    constructor() {
        this._models = {};
    }

    // TODO: Support extending existing models

    isRegistered(modelName: string): boolean {
        return (modelName in this._models);
    }

    register<T extends Model>(model: new(...args: any[]) => T) {

        // Check model constructor
        checkIsModelConstructor(model);
        let modelName = model.name;
        if (this.isRegistered(modelName)) {
            throw new Error(`RegistryError: Model '${modelName}' already exists in the registry.`);
        }

        // Initialise model metadata
        initialiseMeta(model);

        // Add prototype and metadata to the registry
        this._models[modelName] = model;
    }

    getModelNames(): string[] {
        return Object.keys(this._models);
    }

    getModel(modelName: string) {
        if (!this.isRegistered(modelName)) {
            throw new Error(`RegistryError: Model  '${modelName}' does not exist in the registry.`);
        }
        return this._models[modelName];
    }

    clearRegistry() {
        this._models = {};
    }
}

export const registry = new ModelRegistry();

export function register<T extends Model>(model: new(...args: any[]) => T) {
    registry.register(model);
}
