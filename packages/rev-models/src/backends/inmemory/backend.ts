
import { IModel, IModelMeta, IModelManager, ICreateMeta, IUpdateMeta, IReadMeta, IRemoveMeta, IExecMeta, IRawValues } from '../../models/types';
import { ModelOperationResult } from '../../operations/operationresult';
import { QueryParser } from '../../queries/queryparser';
import { InMemoryQuery } from './query';
import { sortRecords } from './sort';
import { AutoNumberField, RelatedModelField, RelatedModelListField } from '../../fields';
import { sleep } from '../../__test_utils__';
import { IForeignKeyValues, getOwnRelatedFieldNames, getRelatedModelInstances, getRelatedModelListInstances } from '../utils';
import { IBackend, ICreateParams, IUpdateParams, IReadParams, IRemoveParams, IExecParams } from '../backend';

/**
 * The InMemoryBackend stores your model data in JavaScript objects. This
 * backend is useful during initial development and testing but **should not be
 * used in production!**
 *
 * Usage example:
 *
 * ```ts
 * [[include:examples/src/using_backends/using_an_inmemory_backend.ts]]
 * ```
 */
export class InMemoryBackend implements IBackend {
    private _storage: {
        [modelName: string]: any[]
    } = {};
    private _sequences: {
        [modelName: string]: {
            [fieldName: string]: number
        }
    } = {};

    /**
     * This property can be used to artificially slow-down model operations,
     * so, for example, you can see how your UI behaves while loading data.
     */
    OPERATION_DELAY = 0;

    constructor() {
        this._storage = {};
    }

    /**
     * This method can be used to quickly populate the backend with raw
     * JavaScript object data
     * @param manager The associated model manager
     * @param model The model class of the data you are loading
     * @param data An array of raw JavaScript objects representing the data
     */
    async load<T extends IModel>(
            manager: IModelManager,
            model: new(...args: any[]) => T,
            data: any[]): Promise<void> {

        let meta = manager.getModelMeta(model);
        let modelStorage = this._getModelStorage(meta);

        if (typeof data != 'object' || !(data instanceof Array)
                || (data.length > 0 && typeof data[0] != 'object')) {
            throw new Error('load() data must be an array of objects');
        }

        for (let record of data) {
            modelStorage.push(record);
        }
    }

    /**
     * @private
     */
    async create<T extends IModel>(
            manager: IModelManager,
            model: T,
            params: ICreateParams,
            result: ModelOperationResult<T, ICreateMeta>): Promise<ModelOperationResult<T, ICreateMeta>> {

        if (this.OPERATION_DELAY) {
            await sleep(this.OPERATION_DELAY);
        }

        let meta = manager.getModelMeta(model);
        let modelStorage = this._getModelStorage(meta);

        let record = {};
        this._writeFields(manager, 'create', model, meta, record);
        modelStorage.push(record);

        result.result = manager.hydrate(meta.ctor, record);
        return result;
    }

    /**
     * @private
     */
    async update<T extends IModel>(
            manager: IModelManager,
            model: T,
            params: IUpdateParams,
            result: ModelOperationResult<T, IUpdateMeta>): Promise<ModelOperationResult<T, IUpdateMeta>> {

        if (!params.where) {
            throw new Error(`update() requires the 'where' option to be set.`);
        }

        if (this.OPERATION_DELAY) {
            await sleep(this.OPERATION_DELAY);
        }

        let meta = manager.getModelMeta(model);
        let parser = new QueryParser(manager);
        let queryNode = parser.getQueryNodeForQuery(meta.ctor, params.where);
        let query = new InMemoryQuery(queryNode);

        let modelStorage = this._getModelStorage(meta);
        let updateCount = 0;
        for (let record of modelStorage) {
            if (query.testRecord(record)) {
                this._writeFields(manager, 'update', model, meta, record, params.fields);
                updateCount++;
            }
        }
        result.setMeta({ totalCount: updateCount });
        return result;
    }

    /**
     * @private
     */
    async read<T extends IModel>(
            manager: IModelManager,
            model: new(...args: any[]) => T,
            params: IReadParams,
            result: ModelOperationResult<T, IReadMeta>): Promise<ModelOperationResult<T, IReadMeta>> {

        if (this.OPERATION_DELAY) {
            await sleep(this.OPERATION_DELAY);
        }

        let meta = manager.getModelMeta(model);
        let modelStorage = this._getModelStorage(meta);
        let parser = new QueryParser(manager);
        let queryNode = parser.getQueryNodeForQuery(model, params.where || {});
        let query = new InMemoryQuery(queryNode);

        const primaryKeyValues: any[] = [];
        const foreignKeyValues: IForeignKeyValues = {};
        const rawValues: IRawValues = [];

        const relatedFieldNames = getOwnRelatedFieldNames(params.related);

        // Populate scalar values and cache related model information
        result.results = [];
        for (let record of modelStorage) {

            if (query.testRecord(record)) {

                let modelInstance = manager.hydrate(model, record);
                result.results.push(modelInstance);
                if (meta.primaryKey) {
                    primaryKeyValues.push(modelInstance[meta.primaryKey]);
                }

                if (relatedFieldNames) {
                    for (let fieldName of relatedFieldNames) {
                        let field = meta.fieldsByName[fieldName];
                        let keyValue = record[fieldName];
                        if (field instanceof RelatedModelField) {
                            if (!(fieldName in foreignKeyValues)) {
                                foreignKeyValues[fieldName] = [];
                            }
                            if (typeof keyValue != 'undefined' && keyValue !== null) {
                                modelInstance[fieldName] = keyValue;
                                if (foreignKeyValues[fieldName].indexOf(keyValue) == -1) {
                                    foreignKeyValues[fieldName].push(keyValue);
                                }
                            }
                            else {
                                modelInstance[fieldName] = null;
                            }
                        }
                    }
                }

                if (params.rawValues) {
                    let rawValueObj = {};
                    for (let fieldName of params.rawValues) {
                        rawValueObj[fieldName] = record[fieldName];
                    }
                    rawValues.push(rawValueObj);
                }
            }
        }

        if (relatedFieldNames) {
            // Get related record data
            const related = await Promise.all([
                getRelatedModelInstances(manager, meta, foreignKeyValues, params),
                getRelatedModelListInstances(manager, meta, primaryKeyValues, params)
            ]);
            const [relatedModelInstances, relatedModelListInstances] = related;

            for (let instance of result.results) {
                for (let fieldName of relatedFieldNames) {
                    let field = meta.fieldsByName[fieldName];
                    if (field instanceof RelatedModelField) {
                        if (instance[fieldName] !== null
                            && relatedModelInstances[fieldName]
                            && relatedModelInstances[fieldName][instance[fieldName]]) {
                                instance[fieldName] = relatedModelInstances[fieldName][instance[fieldName]];
                        }
                        else {
                            instance[fieldName] = null;
                        }
                    }
                    else if (field instanceof RelatedModelListField) {
                        if (relatedModelListInstances[fieldName]
                            && relatedModelListInstances[fieldName][instance[meta.primaryKey!]]) {
                                instance[fieldName] = relatedModelListInstances[fieldName][instance[meta.primaryKey!]];
                        }
                        else {
                            instance[fieldName] = [];
                        }
                    }
                }
            }
        }

        if (params.rawValues) {
            result.setMeta({ rawValues: rawValues });
        }
        if (params.orderBy) {
            result.results = sortRecords(result.results, params.orderBy) as T[];
            result.setMeta({ orderBy: params.orderBy });
        }
        result.setMeta({
            offset: params.offset,
            limit: params.limit,
            totalCount: result.results.length
        });
        result.results = result.results.slice(
            result.meta.offset,
            result.meta.offset + result.meta.limit);

        return result;
    }

    /**
     * @private
     */
    async remove<T extends IModel>(
            manager: IModelManager,
            model: T,
            params: IRemoveParams,
            result: ModelOperationResult<T, IRemoveMeta>): Promise<ModelOperationResult<T, IRemoveMeta>> {

        if (!params.where) {
            throw new Error('remove() requires the \'where\' option to be set');
        }

        if (this.OPERATION_DELAY) {
            await sleep(this.OPERATION_DELAY);
        }

        let meta = manager.getModelMeta(model);
        let parser = new QueryParser(manager);
        let queryNode = parser.getQueryNodeForQuery(meta.ctor, params.where);
        let query = new InMemoryQuery(queryNode);

        let modelStorage = this._getModelStorage(meta);
        let removeCount = 0;
        let newStorage = [];
        for (let record of modelStorage) {
            if (query.testRecord(record)) {
                removeCount++;
            }
            else {
                newStorage.push(record);
            }
        }
        this._setModelStorage(meta, newStorage);
        result.setMeta({ totalCount: removeCount });
        return result;
    }

    /**
     * @private
     */
    async exec<R>(manager: IModelManager, model: IModel, params: IExecParams, result: ModelOperationResult<R, IExecMeta>): Promise<ModelOperationResult<R, IExecMeta>> {
        return Promise.reject(new Error('InMemoryBackend.exec() not supported'));
    }

    private _getModelStorage(meta: IModelMeta<any>): any {
        if (!this._storage[meta.name]) {
            this._storage[meta.name] = [];
        }
        return this._storage[meta.name];
    }

    private _setModelStorage(meta: IModelMeta<any>, data: any[]): any {
        this._storage[meta.name] = data;
    }

    private _getNextSequence(meta: IModelMeta<any>, field: string) {
        if (!this._sequences[meta.name]) {
            this._sequences[meta.name] = {};
        }
        if (!this._sequences[meta.name][field]) {
            this._sequences[meta.name][field] = 0;
        }
        return ++this._sequences[meta.name][field];
    }

    private _writeFields<T extends IModel>(manager: IModelManager, operation: string, model: T, meta: IModelMeta<any>, target: any, fields?: string[]): void {
        let fieldList = fields ? fields : Object.keys(meta.fieldsByName);
        for (let fieldName of fieldList) {

            let field = meta.fieldsByName[fieldName];
            if (field.options.stored) {
                if (field instanceof AutoNumberField
                        && operation == 'create'
                        && typeof model[fieldName] == 'undefined') {
                    target[fieldName] = this._getNextSequence(meta, fieldName);
                }
                else if (typeof model[fieldName] != 'undefined') {
                    let value = field.toBackendValue(manager, model[fieldName]);
                    if (typeof value != 'undefined') {
                        target[fieldName] = value;
                    }
                }
            }
        }
    }

}
