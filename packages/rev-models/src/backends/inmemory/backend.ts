
import { IBackend } from '../';
import { IModelMeta } from '../../models/meta';
import { ModelOperationResult } from '../../operations/operationresult';
import { Model } from '../../models/model';
import { ICreateOptions, ICreateMeta } from '../../operations/create';
import { IUpdateOptions, IUpdateMeta } from '../../operations/update';
import { IReadOptions, IReadMeta } from '../../operations/read';
import { IRemoveOptions, IRemoveMeta } from '../../operations/remove';
import { QueryParser } from '../../queries/queryparser';
import { InMemoryQuery } from './query';
import { sortRecords } from './sort';
import { ModelRegistry } from '../../registry/registry';

export class InMemoryBackend implements IBackend {
    _storage: {
        [modelName: string]: any
    } = {};

    constructor() {
        this._storage = {};
    }

    load<T extends Model>(registry: ModelRegistry, model: new(...args: any[]) => T, data: Array<Partial<T>>, result: ModelOperationResult<T, null>): Promise<ModelOperationResult<T, null>> {
        return new Promise<ModelOperationResult<T, null>>((resolve) => {

            let meta = registry.getModelMeta(model);
            let modelStorage = this._getModelStorage(meta);

            if (typeof data != 'object' || !(data instanceof Array)
                    || (data.length > 0 && typeof data[0] != 'object')) {
                throw new Error('load() data must be an array of objects');
            }

            for (let srcRecord of data) {
                let record = {};
                this._writeFields(srcRecord, meta, record);
                modelStorage.push(record);
            }

            resolve(result);

        });
    }

    create<T extends Model>(registry: ModelRegistry, model: T, result: ModelOperationResult<T, ICreateMeta>, options: ICreateOptions): Promise<ModelOperationResult<T, ICreateMeta>> {
        return new Promise<ModelOperationResult<T, ICreateMeta>>((resolve) => {

            let meta = registry.getModelMeta(model);
            let modelStorage = this._getModelStorage(meta);

            let record = {};
            this._writeFields(model, meta, record);
            modelStorage.push(record);

            result.result = new meta.ctor(record);
            resolve(result);

        });
    }

    update<T extends Model>(registry: ModelRegistry, model: T, where: object, result: ModelOperationResult<T, IUpdateMeta>, options: IUpdateOptions): Promise<ModelOperationResult<T, IUpdateMeta>> {
        return new Promise<ModelOperationResult<T, IUpdateMeta>>((resolve) => {

            if (!where) {
                throw new Error('update() requires the \'where\' parameter');
            }

            let meta = registry.getModelMeta(model);
            let parser = new QueryParser(registry);
            let queryNode = parser.getQueryNodeForQuery(meta.ctor, where);
            let query = new InMemoryQuery(queryNode);

            let modelStorage = this._getModelStorage(meta);
            let updateCount = 0;
            for (let record of modelStorage) {
                if (query.testRecord(record)) {
                    this._writeFields(model, meta, record, options.fields);
                    updateCount++;
                }
            }
            result.setMeta({ total_count: updateCount });
            resolve(result);

        });
    }

    read<T extends Model>(registry: ModelRegistry, model: new(...args: any[]) => T, where: object, result: ModelOperationResult<T, IReadMeta>, options: IReadOptions): Promise<ModelOperationResult<T, IReadMeta>> {
        return new Promise<ModelOperationResult<T, IReadMeta>>((resolve) => {

            let meta = registry.getModelMeta(model);
            if (!where) {
                throw new Error('read() requires the \'where\' parameter');
            }
            if (options.limit < 1) {
                throw new Error('options.limit cannot be less than 1');
            }
            if (options.offset < 0) {
                throw new Error('options.offset cannot be less than zero');
            }

            let modelStorage = this._getModelStorage(meta);
            let parser = new QueryParser(registry);
            let queryNode = parser.getQueryNodeForQuery(model, where);
            let query = new InMemoryQuery(queryNode);
            result.results = [];
            for (let record of modelStorage) {
                if (query.testRecord(record)) {
                    result.results.push(new model(record));
                }
            }
            if (options.order_by) {
                result.results = sortRecords(result.results, options.order_by) as T[];
                result.setMeta({ order_by: options.order_by });
            }
            result.setMeta({
                offset: options.offset,
                limit: options.limit,
                total_count: result.results.length
            });
            result.results = result.results.slice(
                result.meta.offset,
                result.meta.offset + result.meta.limit);
            resolve(result);
        });
    }

    remove<T extends Model>(registry: ModelRegistry, model: T, where: object, result: ModelOperationResult<T, IRemoveMeta>, options: IRemoveOptions): Promise<ModelOperationResult<T, IRemoveMeta>> {
        throw new Error('remove() not yet implemented');
    }

    _getModelStorage(meta: IModelMeta<any>): any {
        if (!this._storage[meta.name]) {
            this._storage[meta.name] = [];
        }
        return this._storage[meta.name];
    }

    _writeFields<T extends Model>(model: T, meta: IModelMeta<any>, target: any, fields?: string[]): void {
        let fieldList = fields ? fields : Object.keys(meta.fieldsByName);
        for (let field of fieldList) {
            if (typeof model[field] != 'undefined') {
                target[field] = model[field];
            }
        }
    }

}
