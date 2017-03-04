
import { IModel, checkIsModelConstructor } from 'rev-models/lib/models';
import { IFormMeta, checkFormMeta } from '../forms/meta';

import { registry as modelRegistry } from 'rev-models/lib/registry';

export class ModelFormRegistry {

    private _formMeta: {
        [modelName: string]: {
            [formName: string]: IFormMeta
        }
    };

    constructor() {
        this._formMeta = {};
    }

    public isRegistered(modelName: string, formName: string) {
        return (modelName && formName
                && (modelName in this._formMeta)
                && (formName in this._formMeta[modelName]));
    }

    public register<T extends IModel>(model: new() => T, formName: string, formMeta: IFormMeta) {

        // Check model constructor
        checkIsModelConstructor(model);
        let modelName = model.name;
        if (!modelRegistry.isRegistered(modelName)) {
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
        let modelMeta = modelRegistry.getMeta(modelName);
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

export const registry = new ModelFormRegistry();

export function register<T extends IModel>(model: new() => T, formName: string, formMeta: IFormMeta) {
    registry.register(model, formName, formMeta);
}
