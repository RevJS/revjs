
import { IModel, ModelManager } from 'rev-models';
import { IFormMeta, checkFormMeta } from '../forms/meta';

export class ModelFormManager {

    modelManager: ModelManager;
    _formMeta: {
        [modelName: string]: {
            [formName: string]: IFormMeta
        }
    };

    constructor(modelManager: ModelManager) {
        if (typeof modelManager != 'object' || !(modelManager instanceof ModelManager)) {
            throw new Error(`ApiManagerError: Invalid ModelManager passed in constructor.`);
        }
        this.modelManager = modelManager;
        this._formMeta = {};
    }

    public isRegistered(modelName: string, formName: string) {
        return (modelName && formName
                && (modelName in this._formMeta)
                && (formName in this._formMeta[modelName]));
    }

    public register<T extends IModel>(model: new() => T, formName: string, formMeta: IFormMeta) {

        // Check model constructor
        if (!model || !model.name) {
            throw new Error(`FormManagerError: Invalid model specified.`);
        }

        let modelName = model.name;
        if (!this.modelManager.isRegistered(modelName)) {
            throw new Error(`FormManagerError: Model '${modelName}' has not been registered.`);
        }

        // Check form name
        if (!formName || typeof formName != 'string') {
            throw new Error(`FormManagerError: Invalid formName specified.`);
        }
        if (this.isRegistered(modelName, formName)) {
            throw new Error(`FormManagerError: Form '${formName}' is already defined for model '${modelName}'.`);
        }

        // Check form meta
        let modelMeta = this.modelManager.getModelMeta(modelName);
        checkFormMeta(modelMeta, formMeta);

        // Add form meta to the Manager
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
            throw new Error(`FormManagerError: Form '${formName}' is not defined for model '${modelName}'.`);
        }
        return this._formMeta[modelName][formName];
    }

    public clearManager() {
        this._formMeta = {};
    }
}
