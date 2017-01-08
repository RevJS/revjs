
import { IStorage } from './';
import { IModelMeta } from '../models/meta';
import { IModel, ICreateOptions, IReadOptions, IUpdateOptions, IRemoveOptions } from '../models';
import { ModelOperationResult } from '../models/operations';

export class InMemoryStorage implements IStorage {
    private storage: {
        [modelName: string]: any
    } = {};

    constructor(options: any = {}) {
        // TODO: Do Stuff...
    }

    public create<T extends IModel>(model: T, meta: IModelMeta<T>, result: ModelOperationResult<T>, options?: ICreateOptions): Promise<void> {
        return new Promise<void>((resolve) => {
            if (meta.singleton) {
                throw new Error('InMemoryStorage.create() cannot be called on singleton models');
            }
            let modelData = this.getModelData(meta);
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
            let modelData = this.getModelData(meta);
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
            let modelData = this.getModelData<T>(meta, false);
            if (!modelData) {
                resolve(/*meta.singleton ? {} : []*/);
            }
            else {
                if (meta.singleton) {
                    resolve(/*[modelData]*/);
                }
                else {
                    // TODO: Implement filtering
                    resolve(modelData);
                }
            }
        });
    }

    public remove<T extends IModel>(model: new() => T, meta: IModelMeta<T>, where: any, result: ModelOperationResult<T>, options?: IRemoveOptions): Promise<void> {
        throw new Error('InMemoryStorage.delete() not yet implemented');
    }

    private getModelData<T extends IModel>(meta: IModelMeta<T>, init = true): any {
        if (!this.storage[meta.name] && init) {
            if (meta.singleton) {
                this.storage[meta.name] = {};
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
