
import { IBackend } from './';
import { IModelMeta } from '../models/meta';
import { Model, ICreateOptions, IReadOptions, IUpdateOptions, IRemoveOptions } from '../models';
import { ModelOperationResult, ILoadOptions } from '../models/operations';
import { checkIsModelInstance, checkMetadataInitialised } from '../models/utils';

export class InMemoryBackend implements IBackend {
    _storage: {
        [modelName: string]: any
    } = {};

    constructor() {
        this._storage = {};
    }

    load<T extends Model>(data: T[], meta: IModelMeta, result: ModelOperationResult<T>, options?: ILoadOptions): Promise<void> {
        return new Promise<void>(() => {

            checkMetadataInitialised(meta);
            if (meta.singleton) {
                throw new Error('InMemoryBackend.load() cannot be used with a singleton model');
            }

            if (typeof data != 'object' || !(data instanceof Array)
                    || (data.length > 0 && typeof data[0] != 'object')) {
                throw new Error('InMemoryBackend.load() data must be an array of objects');
            }

            this._storage[meta.name] = data;

        });
    }

    create<T extends Model>(model: T, meta: IModelMeta, result: ModelOperationResult<T>, options?: ICreateOptions): Promise<void> {
        return new Promise<void>((resolve) => {

            checkIsModelInstance(model);
            checkMetadataInitialised(meta);

            if (meta.singleton) {
                throw new Error('InMemoryBackend.create() cannot be called on singleton models');
            }

            let modelData = this._getModelData(model.constructor as any, meta);
            let record = {};
            this._writeFields(model, meta, record);
            modelData.push(record);
        });
    }

    update<T extends Model>(model: T, meta: IModelMeta, where: any, result: ModelOperationResult<T>, options?: IUpdateOptions): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!meta.singleton && !where) {
                throw new Error('InMemoryBackend.update() requires the \'where\' parameter for non-singleton models');
            }
            let modelData = this._getModelData(model.constructor as any, meta);
            if (meta.singleton) {
                this._writeFields(model, meta, modelData);
                resolve(/*true*/);
            }
            else {
                throw new Error('InMemoryBackend.update() not yet implemented for non-singleton models');
            }
        });
    }

    read<T extends Model>(model: new() => T, meta: IModelMeta, where: any, result: ModelOperationResult<T>, options?: IReadOptions): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!meta.singleton && !where) {
                throw new Error('InMemoryBackend.read() requires the \'where\' parameter for non-singleton models');
            }
            let modelData = this._getModelData<T>(model, meta);
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

    remove<T extends Model>(meta: IModelMeta, where: any, result: ModelOperationResult<T>, options?: IRemoveOptions): Promise<void> {
        throw new Error('InMemoryBackend.delete() not yet implemented');
    }

    _getModelData<T extends Model>(model: new() => T, meta: IModelMeta): any {
        if (!this._storage[meta.name]) {
            if (meta.singleton) {
                this._storage[meta.name] = new model();
            }
            else {
                this._storage[meta.name] = [];
            }
        }
        return this._storage[meta.name];
    }

    _writeFields<T extends Model>(model: T, meta: IModelMeta, target: any): void {
        for (let field of meta.fields) {
            target[field.name] = model[field.name];
        }
    }

}
