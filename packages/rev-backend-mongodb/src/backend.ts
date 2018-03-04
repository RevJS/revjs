
import { IModel, ModelManager, fields } from 'rev-models';
import { MongoClient, Db, MongoClientOptions } from 'mongodb';

import { IBackend } from 'rev-models/lib/backends/backend';
import { ModelOperationResult } from 'rev-models/lib/operations/operationresult';
import {
    ICreateMeta, ICreateOptions, IUpdateMeta, IUpdateOptions, IRemoveMeta,
    IRemoveOptions, IReadMeta, IReadOptions, IExecMeta, IExecOptions, IModelMeta
} from 'rev-models/lib/models/types';
import { QueryParser } from 'rev-models/lib/queries/queryparser';
import { IQueryNode } from 'rev-models/lib/queries/types';
import { ConjunctionNode, FieldNode, ValueOperator } from 'rev-models/lib/queries/nodes';
import { getLikeOperatorRegExp } from 'rev-models/lib/queries/utils';

export interface IMongoDBBackendConfig {
    url: string;
    dbName: string;
    options?: MongoClientOptions;
}

const FIELD_OPERATOR_MAPPING = {
    eq: '$eq',
    ne: '$ne',
    gt: '$gt',
    gte: '$gte',
    lt: '$lt',
    lte: '$lte',
    like: '__like',
    in: '$in',
    nin: '$nin'
};

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

    private _convertConjunctionNode(srcNode: ConjunctionNode<any>, destNode: object) {
        if (srcNode.children.length == 0) {
            return;
        }
        const mongoOperator = (srcNode.operator == 'and' && '$and') || (srcNode.operator == 'or' && '$or');
        if (!mongoOperator) {
            throw new Error(`Conjunction Operator '${srcNode.operator}' not recognised.`);
        }
        destNode[mongoOperator] = srcNode.children.map((child) => {
            const childDestNode = {};
            this._convertQueryNode(child, childDestNode);
            return childDestNode;
        });
    }

    private _convertFieldNode(srcNode: FieldNode<any>, destNode: object) {
        destNode[srcNode.fieldName] = {};
        for (let valueNode of srcNode.children as Array<ValueOperator<any>>) {
            let mongoOperator = FIELD_OPERATOR_MAPPING[valueNode.operator];
            if (!mongoOperator) {
                throw new Error(`Field Value Operator '${valueNode.operator}' not recognised.`);
            }
            let value = valueNode.value;
            if (mongoOperator == '__like') {
                mongoOperator = '$regex';
                value = getLikeOperatorRegExp(value);
            }
            destNode[srcNode.fieldName][mongoOperator] = value;
        }
    }

    private _convertQueryNode(srcNode: IQueryNode<any>, destNode: object) {
        if (srcNode instanceof ConjunctionNode) {
            this._convertConjunctionNode(srcNode, destNode);
        }
        else if (srcNode instanceof FieldNode) {
            return this._convertFieldNode(srcNode, destNode);
        }
        else {
            throw new Error(`Unrecognised Query Node: ${srcNode.constructor.name}`);
        }

    }

    // TODO: Tests!!!
    private _convertQuery<T extends IModel>(manager: ModelManager, model: new() => T, where: object) {
        const parser = new QueryParser(manager);
        const queryNode = parser.getQueryNodeForQuery(model, where);
        const mongoQuery = {};
        this._convertQueryNode(queryNode, mongoQuery);
        return mongoQuery;
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

        const mongoQuery = this._convertQuery(manager, model, options.where);
        console.log('Mongo Query', JSON.stringify(mongoQuery));

        const records = await this.db.collection(colName).find(mongoQuery).toArray();
        result.results = records.map((record) => manager.hydrate(meta.ctor, record));
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
