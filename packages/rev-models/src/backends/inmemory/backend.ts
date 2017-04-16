
import { IBackend } from '../';
import { IModelMeta } from '../../models/meta';
import { ModelOperationResult } from '../../operations/operationresult';
import { Model } from '../../models/model';
import { ICreateOptions } from '../../operations/create';
import { IUpdateOptions } from '../../operations/update';
import { IReadOptions } from '../../operations/read';
import { IRemoveOptions } from '../../operations/remove';
import { QueryParser } from '../../queries/queryparser';
import { InMemoryQuery } from './query';

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

            if (typeof data != 'object' || !(data instanceof Array)
                    || (data.length > 0 && typeof data[0] != 'object')) {
                throw new Error('load() data must be an array of objects');
            }

            this._storage[meta.name] = data;
            resolve(result);

        });
    }

    create<T extends Model>(model: T, result: ModelOperationResult<T>, options: ICreateOptions): Promise<ModelOperationResult<T>> {
        return new Promise<ModelOperationResult<T>>((resolve) => {

            let meta = model.getMeta();
            let modelStorage = this._getModelStorage(model.constructor as any, meta);

            let record = {};
            this._writeFields(model, meta, record);
            modelStorage.push(record);

            result.result = new meta.ctor(record);
            resolve(result);

        });
    }

    update<T extends Model>(model: T, where: object, result: ModelOperationResult<T>, options: IUpdateOptions): Promise<ModelOperationResult<T>> {
        return new Promise<ModelOperationResult<T>>((resolve) => {

            if (!where) {
                throw new Error('update() requires the \'where\' parameter');
            }

            throw new Error('update() not yet implemented');

            // let meta = model.getMeta();
            // let modelStorage = this._getModelStorage(model.constructor as any, meta);
            // this._writeFields(model, meta, modelStorage);
            // resolve(result);

        });
    }

    read<T extends Model>(model: new(...args: any[]) => T, where: object, result: ModelOperationResult<T>, options: IReadOptions): Promise<ModelOperationResult<T>> {
        return new Promise<ModelOperationResult<T>>((resolve) => {

            let meta = model.meta;
            if (!where) {
                throw new Error('read() requires the \'where\' parameter');
            }

            let modelStorage = this._getModelStorage<T>(model, meta);
            let parser = new QueryParser();
            let queryNode = parser.getQueryNodeForQuery(where, model);
            let query = new InMemoryQuery(queryNode);
            result.results = [];
            for (let record of modelStorage) {
                if (query.testRecord(record)) {
                    result.results.push(new model(record));
                }
            }
            options.offset = Math.max(0, options.offset);
            options.limit = Math.max(0, options.limit);
            result.results = result.results.slice(
                options.offset, options.offset + options.limit);
            resolve(result);
        });
    }

    remove<T extends Model>(model: new() => T, where: object, result: ModelOperationResult<T>, options: IRemoveOptions): Promise<ModelOperationResult<T>> {
        throw new Error('delete() not yet implemented');
    }

    _getModelStorage<T extends Model>(model: new() => T, meta: IModelMeta): any {
        if (!this._storage[meta.name]) {
            this._storage[meta.name] = [];
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
