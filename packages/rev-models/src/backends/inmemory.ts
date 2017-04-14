
import { IBackend } from './';
import { IModelMeta } from '../models/meta';
import { ModelOperationResult } from '../operations/operationresult';
import { Model } from '../models/model';
import { ICreateOptions } from '../operations/create';
import { IUpdateOptions } from '../operations/update';
import { IReadOptions } from '../operations/read';
import { IRemoveOptions } from '../operations/remove';

export class InMemoryBackend implements IBackend {
    _storage: {
        [modelName: string]: any
    } = {};

    constructor() {
        this._storage = {};
    }

    load<T extends Model>(model: new(...args: any[]) => T, data: T[], result: ModelOperationResult<T>): Promise<ModelOperationResult<T>> {
        return new Promise<ModelOperationResult<T>>((resolve) => {

            let meta = model.meta;
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

    create<T extends Model>(model: T, result: ModelOperationResult<T>, options?: ICreateOptions): Promise<ModelOperationResult<T>> {
        return new Promise<ModelOperationResult<T>>((resolve) => {

            let meta = model.getMeta();
            if (meta.singleton) {
                throw new Error('InMemoryBackend.create() cannot be called on singleton models');
            }

            let modelData = this._getModelData(model.constructor as any, meta);
            let record = {};
            this._writeFields(model, meta, record);
            modelData.push(record);
            resolve(result);

        });
    }

    update<T extends Model>(model: T, where: any, result: ModelOperationResult<T>, options?: IUpdateOptions): Promise<ModelOperationResult<T>> {
        return new Promise<ModelOperationResult<T>>((resolve) => {

            let meta = model.getMeta();
            if (!meta.singleton && !where) {
                throw new Error('InMemoryBackend.update() requires the \'where\' parameter for non-singleton models');
            }
            let modelData = this._getModelData(model.constructor as any, meta);
            if (meta.singleton) {
                this._writeFields(model, meta, modelData);
                resolve(result);
            }
            else {
                throw new Error('InMemoryBackend.update() not yet implemented for non-singleton models');
            }

        });
    }

    read<T extends Model>(model: new() => T, where: any, result: ModelOperationResult<T>, options?: IReadOptions): Promise<ModelOperationResult<T>> {
        return new Promise<ModelOperationResult<T>>((resolve) => {

            let meta = model.meta;
            if (!meta.singleton && !where) {
                throw new Error('InMemoryBackend.read() requires the \'where\' parameter for non-singleton models');
            }
            let modelData = this._getModelData<T>(model, meta);
            if (meta.singleton) {
                result.result = modelData;
                resolve(result);
            }
            else {
                // TODO: Implement filtering
                result.results = modelData;
                resolve(result);
            }

        });
    }

    remove<T extends Model>(model: new() => T, where: any, result: ModelOperationResult<T>, options?: IRemoveOptions): Promise<ModelOperationResult<T>> {
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
