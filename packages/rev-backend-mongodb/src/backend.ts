
import { IModel, ModelManager, fields } from 'rev-models';
import { MongoClient, Db, MongoClientOptions } from 'mongodb';

import { IBackend } from 'rev-models/lib/backends';
import { getOwnRelatedFieldNames, IForeignKeyValues, getRelatedModelInstances, getRelatedModelListInstances } from 'rev-models/lib/backends/utils';

import { ModelOperationResult } from 'rev-models/lib/operations/operationresult';
import {
    ICreateMeta, ICreateOptions, IUpdateMeta, IUpdateOptions, IRemoveMeta,
    IRemoveOptions, IReadMeta, IReadOptions, IExecMeta, IExecOptions, IModelMeta, IRawValues
} from 'rev-models/lib/models/types';
import { convertQuery } from './query';

export interface IMongoDBBackendConfig {
    url: string;
    dbName: string;
    options?: MongoClientOptions;
}

export const AUTONUMBER_COLLECTION = '__revjs_autonumber';

export class MongoDBBackend implements IBackend {
    client: MongoClient;
    db: Db;

    constructor(
        private config: IMongoDBBackendConfig
    ) {}

    async connect() {
        this.client = await MongoClient.connect(this.config.url, this.config.options);
        this.db = this.client.db(this.config.dbName);
    }

    async disconnect() {
        if (this.client) {
            this.client.close();
            this.client = null;
        }
    }

    getMongoClient() {
        return this.client;
    }

    private _getCollectionName(meta: IModelMeta<any>) {
        return meta.name;
    }

    private _convertOrderBy(orderBy: string[]) {
        const sortDocument = {};
        if (orderBy instanceof Array) {
            orderBy.forEach((field) => {
                const tokens = field.split(' ');
                const order = tokens[1] == 'desc' ? -1 : 1;
                sortDocument[tokens[0]] = order;
            });
        }
        return sortDocument;
    }

    private async _getNextAutoNumberValue(modelName: string, fieldName: string): Promise<number> {
        const sequenceName = `${modelName}__${fieldName}`;
        const res = await this.db.collection(AUTONUMBER_COLLECTION)
            .findOneAndUpdate(
                { _id: sequenceName },
                { $inc: { nextValue: 1 }},
                { upsert: true, returnOriginal: false });
        return res.value.nextValue;
    }

    async create<T extends IModel>(manager: ModelManager, model: T, options: ICreateOptions, result: ModelOperationResult<T, ICreateMeta>): Promise<ModelOperationResult<T, ICreateMeta>> {
        const meta = manager.getModelMeta(model);

        const document = {};
        let fieldList = Object.keys(meta.fieldsByName);
        for (let fieldName of fieldList) {
            let field = meta.fieldsByName[fieldName];
            if (field instanceof fields.AutoNumberField
                    && typeof model[fieldName] == 'undefined') {
                document[fieldName] = await this._getNextAutoNumberValue(meta.name, fieldName);
            }
            else if (typeof model[fieldName] != 'undefined') {
                let value = field.toBackendValue(manager, model[fieldName]);
                if (typeof value != 'undefined') {
                    document[fieldName] = value;
                }
            }
        }

        const colName = this._getCollectionName(meta);
        const createResult = await this.db.collection(colName).insertOne(document);
        if (createResult.insertedCount != 1) {
            throw new Error('mongodb insert failed'); // TODO: Something nicer
        }

        result.result = manager.hydrate(meta.ctor, document);
        return result;
    }

    async update<T extends IModel>(manager: ModelManager, model: T, options: IUpdateOptions, result: ModelOperationResult<T, IUpdateMeta>): Promise<ModelOperationResult<T, IUpdateMeta>> {
        if (!options.where) {
            throw new Error('update() requires the \'where\' parameter');
        }

        let meta = manager.getModelMeta(model);
        const mongoQuery = convertQuery(manager, meta.ctor, options.where);

        const fieldUpdates = {};
        options.fields.forEach((fieldName) => {
            const field = meta.fieldsByName[fieldName];
            if (typeof model[fieldName] != 'undefined') {
                let value = field.toBackendValue(manager, model[fieldName]);
                if (typeof value != 'undefined') {
                    fieldUpdates[fieldName] = value;
                }
            }
        });

        const colName = this._getCollectionName(meta);
        const updateResult = await this.db.collection(colName).updateMany(mongoQuery, { $set: fieldUpdates });

        result.setMeta({ totalCount: updateResult.matchedCount });
        return result;
    }

    async remove<T extends IModel>(manager: ModelManager, model: T, options: IRemoveOptions, result: ModelOperationResult<T, IRemoveMeta>): Promise<ModelOperationResult<T, IRemoveMeta>> {
        if (!options.where) {
            throw new Error('remove() requires the \'where\' option to be set');
        }

        let meta = manager.getModelMeta(model);
        const mongoQuery = convertQuery(manager, meta.ctor, options.where);

        const colName = this._getCollectionName(meta);
        const removeResult = await this.db.collection(colName).deleteMany(mongoQuery);

        result.setMeta({ totalCount: removeResult.deletedCount });
        return result;
    }

    async read<T extends IModel>(manager: ModelManager, model: new() => T, options: IReadOptions, result: ModelOperationResult<T, IReadMeta>): Promise<ModelOperationResult<T, IReadMeta>> {
        const meta = manager.getModelMeta(model);
        const colName = this._getCollectionName(meta);

        const mongoQuery = convertQuery(manager, model, options.where);

        const records = await this.db.collection(colName)
            .find(mongoQuery)
            .sort(this._convertOrderBy(options.orderBy))
            .skip(options.offset)
            .limit(options.limit)
            .toArray();

        const primaryKeyValues: any[] = [];
        const foreignKeyValues: IForeignKeyValues = {};
        const rawValues: IRawValues = [];
        const relatedFieldNames = getOwnRelatedFieldNames(options);

        result.results = [];
        records.forEach((record) => {

            const modelInstance = manager.hydrate(meta.ctor, record);
            result.results.push(modelInstance);

            if (meta.primaryKey) {
                primaryKeyValues.push(modelInstance[meta.primaryKey]);
            }

            // TODO: Refactor this into a method shared with InMemoryBackend (and future backends)
            if (relatedFieldNames) {
                for (let fieldName of relatedFieldNames) {
                    let field = meta.fieldsByName[fieldName];
                    let keyValue = record[fieldName];
                    if (field instanceof fields.RelatedModelField) {
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

            if (options.rawValues) {
                let rawValueObj = {};
                for (let fieldName of options.rawValues) {
                    rawValueObj[fieldName] = record[fieldName];
                }
                rawValues.push(rawValueObj);
            }
        });

        // TODO: Refactor this into a method shared with InMemoryBackend (and future backends)
        if (relatedFieldNames) {
            // Get related record data
            const related = await Promise.all([
                getRelatedModelInstances(manager, meta, foreignKeyValues, options),
                getRelatedModelListInstances(manager, meta, primaryKeyValues, options)
            ]);
            const [relatedModelInstances, relatedModelListInstances] = related;

            for (let instance of result.results) {
                for (let fieldName of relatedFieldNames) {
                    let field = meta.fieldsByName[fieldName];
                    if (field instanceof fields.RelatedModelField) {
                        if (instance[fieldName] !== null
                            && relatedModelInstances[fieldName]
                            && relatedModelInstances[fieldName][instance[fieldName]]) {
                                instance[fieldName] = relatedModelInstances[fieldName][instance[fieldName]];
                        }
                    }
                    else if (field instanceof fields.RelatedModelListField) {
                        if (relatedModelListInstances[fieldName]
                            && relatedModelListInstances[fieldName][instance[meta.primaryKey]]) {
                                instance[fieldName] = relatedModelListInstances[fieldName][instance[meta.primaryKey]];
                        }
                        else {
                            instance[fieldName] = [];
                        }
                    }
                }
            }
        }

        if (options.rawValues) {
            result.setMeta({ rawValues });
        }

        result.setMeta({
            offset: options.offset,
            limit: options.limit,
            totalCount: result.results.length
        });

        return result;
    }

    async exec<R>(manager: ModelManager, model: IModel, options: IExecOptions, result: ModelOperationResult<R, IExecMeta>): Promise<ModelOperationResult<R, IExecMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

}
