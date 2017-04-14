
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

    load<T extends Model>(model: new(...args: any[]) => T, data: Array<Partial<T>>, result: ModelOperationResult<T>): Promise<ModelOperationResult<T>> {
        return new Promise<ModelOperationResult<T>>((resolve) => {

            let meta = model.meta;
            if (meta.singleton) {
                throw new Error('load() cannot be used with a singleton model');
            }

            if (typeof data != 'object' || !(data instanceof Array)
                    || (data.length > 0 && typeof data[0] != 'object')) {
                throw new Error('load() data must be an array of objects');
            }

            this._storage[meta.name] = data;
            resolve(result);

        });
    }

    create<T extends Model>(model: T, result: ModelOperationResult<T>, options?: ICreateOptions): Promise<ModelOperationResult<T>> {
        return new Promise<ModelOperationResult<T>>((resolve) => {

            let meta = model.getMeta();
            if (meta.singleton) {
                throw new Error('create() cannot be used with a singleton model');
            }

            let modelStorage = this._getModelStorage(model.constructor as any, meta);
            let record = {};
            this._writeFields(model, meta, record);
            modelStorage.push(record);
            result.result = new meta.ctor(record);
            resolve(result);

        });
    }

    update<T extends Model>(model: T, where: any, result: ModelOperationResult<T>, options?: IUpdateOptions): Promise<ModelOperationResult<T>> {
        return new Promise<ModelOperationResult<T>>((resolve) => {

            let meta = model.getMeta();
            if (!meta.singleton && !where) {
                throw new Error('update() requires the \'where\' parameter for non-singleton models');
            }
            let modelStorage = this._getModelStorage(model.constructor as any, meta);
            if (meta.singleton) {
                this._writeFields(model, meta, modelStorage);
                resolve(result);
            }
            else {
                throw new Error('update() not yet implemented for non-singleton models');
            }

        });
    }

    read<T extends Model>(model: new() => T, where: any, result: ModelOperationResult<T>, options?: IReadOptions): Promise<ModelOperationResult<T>> {
        return new Promise<ModelOperationResult<T>>((resolve) => {

            let meta = model.meta;
            if (!meta.singleton && !where) {
                throw new Error('read() requires the \'where\' parameter for non-singleton models');
            }
            let modelStorage = this._getModelStorage<T>(model, meta);
            if (meta.singleton) {
                result.result = modelStorage;
                resolve(result);
            }
            else {
                // TODO: Implement filtering
                result.results = modelStorage;
                resolve(result);
            }

        });
    }

    remove<T extends Model>(model: new() => T, where: any, result: ModelOperationResult<T>, options?: IRemoveOptions): Promise<ModelOperationResult<T>> {
        throw new Error('delete() not yet implemented');
    }

    _getModelStorage<T extends Model>(model: new() => T, meta: IModelMeta): any {
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
            if (typeof model[field.name] != 'undefined') {
                target[field.name] = model[field.name];
            }
        }
    }

}
