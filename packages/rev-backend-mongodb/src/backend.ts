
import { IModel, ModelManager, fields } from 'rev-models';
import { MongoClient, Db, MongoClientOptions } from 'mongodb';

import { IBackend } from 'rev-models/lib/backends/backend';
import { ModelOperationResult } from 'rev-models/lib/operations/operationresult';
import {
    ICreateMeta, ICreateOptions, IUpdateMeta, IUpdateOptions, IRemoveMeta,
    IRemoveOptions, IReadMeta, IReadOptions, IExecMeta, IExecOptions, IModelMeta
} from 'rev-models/lib/models/types';

export interface IMongoDBBackendConfig {
    url: string;
    dbName: string;
    options?: MongoClientOptions;
}

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

    async create<T extends IModel>(manager: ModelManager, model: T, options: ICreateOptions, result: ModelOperationResult<T, ICreateMeta>): Promise<ModelOperationResult<T, ICreateMeta>> {
        const meta = manager.getModelMeta(model);

        const document = {};
        let fieldList = Object.keys(meta.fieldsByName);
        for (let fieldName of fieldList) {
            let field = meta.fieldsByName[fieldName];
            if (field instanceof fields.AutoNumberField
                    && typeof model[fieldName] == 'undefined') {
                throw new Error('TODO: Implement auto-number fields');
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
        // const meta = manager.getModelMeta(model);
        return result;
    }

    async remove<T extends IModel>(manager: ModelManager, model: T, options: IRemoveOptions, result: ModelOperationResult<T, IRemoveMeta>): Promise<ModelOperationResult<T, IRemoveMeta>> {
        const meta = manager.getModelMeta(model);
        const colName = this._getCollectionName(meta);
        // Remove all data for now
        try {
            await this.db.collection(colName).drop();
        }
        catch (e) {}
        return result;
    }

    async read<T extends IModel>(manager: ModelManager, model: new() => T, options: IReadOptions, result: ModelOperationResult<T, IReadMeta>): Promise<ModelOperationResult<T, IReadMeta>> {
        const meta = manager.getModelMeta(model);
        const colName = this._getCollectionName(meta);
        const records = await this.db.collection(colName).find({}).toArray();
        result.results = records.map((record) => manager.hydrate(meta.ctor, record));
        result.setMeta({
            offset: 0,
            limit: result.results.length,
            totalCount: result.results.length
        });
        return result;
    }

    async exec<R>(manager: ModelManager, model: IModel, options: IExecOptions, result: ModelOperationResult<R, IExecMeta>): Promise<ModelOperationResult<R, IExecMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

}
