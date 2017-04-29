
import { Model, ModelRegistry } from 'rev-models';
import { IFormMeta, checkFormMeta } from '../forms/meta';

export class ModelFormRegistry {

    modelRegistry: ModelRegistry;
    _formMeta: {
        [modelName: string]: {
            [formName: string]: IFormMeta
        }
    };

    constructor(modelRegistry: ModelRegistry) {
        if (typeof modelRegistry != 'object' || !(modelRegistry instanceof ModelRegistry)) {
            throw new Error(`ApiRegistryError: Invalid ModelRegistry passed in constructor.`);
        }
        this.modelRegistry = modelRegistry;
        this._formMeta = {};
    }

    public isRegistered(modelName: string, formName: string) {
        return (modelName && formName
                && (modelName in this._formMeta)
                && (formName in this._formMeta[modelName]));
    }

    public register<T extends Model>(model: new() => T, formName: string, formMeta: IFormMeta) {

        // Check model constructor
        if (!model || !model.name) {
            throw new Error(`FormRegistryError: Invalid model specified.`);
        }

        let modelName = model.name;
        if (!this.modelRegistry.isRegistered(modelName)) {
            throw new Error(`FormRegistryError: Model '${modelName}' has not been registered.`);
        }

        // Check form name
        if (!formName || typeof formName != 'string') {
            throw new Error(`FormRegistryError: Invalid formName specified.`);
        }
        if (this.isRegistered(modelName, formName)) {
            throw new Error(`FormRegistryError: Form '${formName}' is already defined for model '${modelName}'.`);
        }

        // Check form meta
        let modelMeta = this.modelRegistry.getModelMeta(modelName);
        checkFormMeta(modelMeta, formMeta);

        // Add form meta to the registry
        if (!(modelName in this._formMeta)) {
            this._formMeta[modelName] = {};
        }
        this._formMeta[modelName][formName] = formMeta;
    }

    public getForms(modelName: string): {[formName: string]: IFormMeta} {
        if (!(modelName in this._formMeta)) {
            return {};
        }
        return this._formMeta[modelName];
    }

    public getForm(modelName: string, formName: string): IFormMeta {
        if (!(modelName in this._formMeta) || !(formName in this._formMeta[modelName])) {
            throw new Error(`FormRegistryError: Form '${formName}' is not defined for model '${modelName}'.`);
        }
        return this._formMeta[modelName][formName];
    }

    public clearRegistry() {
        this._formMeta = {};
    }
}
