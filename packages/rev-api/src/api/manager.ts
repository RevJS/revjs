
import { ModelManager, IModel } from 'rev-models';
import { checkIsModelConstructor } from 'rev-models/lib/models/utils';
import { initialiseApiMeta } from '../api/meta';
import { IModelApiManager, IApiMeta } from './types';

export class ModelApiManager implements IModelApiManager {

    modelManager: ModelManager;
    _apiMeta: {
        [modelName: string]: IApiMeta
    };

    constructor(modelManager: ModelManager) {
        if (typeof modelManager != 'object' || !(modelManager instanceof ModelManager)) {
            throw new Error(`ApiManagerError: Invalid ModelManager passed in constructor.`);
        }
        this.modelManager = modelManager;
        this._apiMeta = {};
    }

    getModelManager() {
        return this.modelManager;
    }

    isRegistered(modelName: string) {
        return (modelName && (modelName in this._apiMeta));
    }

    register<T extends IModel>(model: new(...args: any[]) => T, apiMeta?: IApiMeta) {
        // Add api meta to the registry if valid
        checkIsModelConstructor(model);
        apiMeta = initialiseApiMeta(this, model, apiMeta);
        this._apiMeta[apiMeta.model] = apiMeta;
    }

    getModelNames(): string[] {
        return Object.keys(this._apiMeta);
    }

    getModelNamesByOperation(operationName: string): string[] {
        let matches: string[] = [];
        for (let modelName in this._apiMeta) {
            if (this._apiMeta[modelName].operations.indexOf(operationName) > -1) {
                matches.push(modelName);
            }

        }
        return matches;
    }

    getApiMeta(modelName: string): IApiMeta {
        if (!(modelName in this._apiMeta)) {
            throw new Error(`ApiManagerError: Model '${modelName}' does not have a registered API.`);
        }
        return this._apiMeta[modelName];
    }

    clearManager() {
        this._apiMeta = {};
    }
}
