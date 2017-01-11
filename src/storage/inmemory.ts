
import { IStorage } from './';
import { IModelMeta } from '../models/meta';
import { IModel, ICreateOptions, IReadOptions, IUpdateOptions, IRemoveOptions } from '../models';
import { ModelOperationResult, ILoadOptions } from '../models/operations';
import { checkIsModelInstance, checkMetadataInitialised } from '../models/utils';

export class InMemoryStorage implements IStorage {
    private storage: {
        [modelName: string]: any
    } = {};

    constructor() {
        this.storage = {};
    }

    public load<T extends IModel>(data: T[], meta: IModelMeta<T>, result: ModelOperationResult<T>, options?: ILoadOptions): Promise<void> {
        return new Promise<void>(() => {

            checkMetadataInitialised(meta);
            if (meta.singleton) {
                throw new Error('InMemoryStorage.load() cannot be used with a singleton model');
            }

            if (typeof data != 'object' || !(data instanceof Array)
                    || (data.length > 0 && typeof data[0] != 'object')) {
                throw new Error('InMemoryStorage.load() data must be an array of objects');
            }

            this.storage[meta.name] = data;

        });
    }

    public create<T extends IModel>(model: T, meta: IModelMeta<T>, result: ModelOperationResult<T>, options?: ICreateOptions): Promise<void> {
        return new Promise<void>((resolve) => {

            checkIsModelInstance(model);
            checkMetadataInitialised(meta);

            if (meta.singleton) {
                throw new Error('InMemoryStorage.create() cannot be called on singleton models');
            }

            let modelData = this.getModelData(<any> model.constructor, meta);
            let record = {};
            this.writeFields(model, meta, record);
            modelData.push(record);
        });
    }

    public update<T extends IModel>(model: T, meta: IModelMeta<T>, where: any, result: ModelOperationResult<T>, options?: IUpdateOptions): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!meta.singleton && !where) {
                throw new Error('InMemoryStorage.update() requires the \'where\' parameter for non-singleton models');
            }
            let modelData = this.getModelData(<any> model.constructor, meta);
            if (meta.singleton) {
                this.writeFields(model, meta, modelData);
                resolve(/*true*/);
            }
            else {
                throw new Error('InMemoryStorage.update() not yet implemented for non-singleton models');
            }
        });
    }

    public read<T extends IModel>(model: new() => T, meta: IModelMeta<T>, where: any, result: ModelOperationResult<T>, options?: IReadOptions): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!meta.singleton && !where) {
                throw new Error('InMemoryStorage.read() requires the \'where\' parameter for non-singleton models');
            }
            let modelData = this.getModelData<T>(model, meta);
            if (meta.singleton) {
                result.result = modelData;
                resolve();
            }
            else {
                // TODO: Implement filtering
                result.results = modelData;
                resolve();
            }
        });
    }

    public remove<T extends IModel>(meta: IModelMeta<T>, where: any, result: ModelOperationResult<T>, options?: IRemoveOptions): Promise<void> {
        throw new Error('InMemoryStorage.delete() not yet implemented');
    }

    private getModelData<T extends IModel>(model: new() => T, meta: IModelMeta<T>): any {
        if (!this.storage[meta.name]) {
            if (meta.singleton) {
                this.storage[meta.name] = new model();
            }
            else {
                this.storage[meta.name] = [];
            }
        }
        return this.storage[meta.name];
    }

    private writeFields<T extends IModel>(model: T, meta: IModelMeta<T>, target: any): void {
        for (let field of meta.fields) {
            target[field.name] = model[field.name];
        }
    }

}
