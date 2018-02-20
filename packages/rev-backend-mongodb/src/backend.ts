
import { IModel, ModelManager } from 'rev-models';
import { MongoClient, Db, MongoClientOptions } from 'mongodb';

import { IBackend } from 'rev-models/lib/backends/backend';
import { ModelOperationResult } from 'rev-models/lib/operations/operationresult';
import {
    ICreateMeta, ICreateOptions, IUpdateMeta, IUpdateOptions, IRemoveMeta,
    IRemoveOptions, IReadMeta, IReadOptions, IExecMeta, IExecOptions
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

    async create<T extends IModel>(manager: ModelManager, model: T, options: ICreateOptions, result: ModelOperationResult<T, ICreateMeta>): Promise<ModelOperationResult<T, ICreateMeta>> {
        // const meta = manager.getModelMeta(model);
        return result;
    }

    async update<T extends IModel>(manager: ModelManager, model: T, options: IUpdateOptions, result: ModelOperationResult<T, IUpdateMeta>): Promise<ModelOperationResult<T, IUpdateMeta>> {
        // const meta = manager.getModelMeta(model);
        return result;
    }

    async remove<T extends IModel>(manager: ModelManager, model: T, options: IRemoveOptions, result: ModelOperationResult<T, IRemoveMeta>): Promise<ModelOperationResult<T, IRemoveMeta>> {
        // const meta = manager.getModelMeta(model);
        return result;
    }

    async read<T extends IModel>(manager: ModelManager, model: new() => T, options: IReadOptions, result: ModelOperationResult<T, IReadMeta>): Promise<ModelOperationResult<T, IReadMeta>> {
        // const meta = manager.getModelMeta(model);
        return result;
    }

    async exec<R>(manager: ModelManager, model: IModel, options: IExecOptions, result: ModelOperationResult<R, IExecMeta>): Promise<ModelOperationResult<R, IExecMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

}
