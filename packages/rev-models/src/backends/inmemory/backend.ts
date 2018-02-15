
import { IBackend } from '../';
import { IModel, IModelMeta, IModelManager, ICreateMeta, ICreateOptions, IUpdateMeta, IUpdateOptions, IReadMeta, IReadOptions, IRemoveMeta, IRemoveOptions, IExecMeta, IExecOptions, IRawValues } from '../../models/types';
import { ModelOperationResult, IModelOperationResult } from '../../operations/operationresult';
import { QueryParser } from '../../queries/queryparser';
import { InMemoryQuery } from './query';
import { sortRecords } from './sort';
import { AutoNumberField, RelatedModelField, RelatedModelListField } from '../../fields';
import { sleep } from '../../__test_utils__';

interface IForeignKeyValues {
    [fieldName: string]: any[];
}

interface IRelatedModelInstances {
    [fieldName: string]: {
        [keyValue: string]: IModel
    };
}

interface IRelatedModelListInstances {
    [fieldName: string]: {
        [keyValue: string]: IModel[]
    };
}

export class InMemoryBackend implements IBackend {
    _storage: {
        [modelName: string]: any[]
    } = {};
    _sequences: {
        [modelName: string]: {
            [fieldName: string]: number
        }
    } = {};
    OPERATION_DELAY = 0;  // Useful for testing

    constructor() {
        this._storage = {};
    }

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

    async create<T extends IModel>(
            manager: IModelManager,
            model: T,
            options: ICreateOptions,
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

    async update<T extends IModel>(
            manager: IModelManager,
            model: T,
            options: IUpdateOptions,
            result: ModelOperationResult<T, IUpdateMeta>): Promise<ModelOperationResult<T, IUpdateMeta>> {

        if (!options.where) {
            throw new Error('update() requires the \'where\' parameter');
        }

        if (this.OPERATION_DELAY) {
            await sleep(this.OPERATION_DELAY);
        }

        let meta = manager.getModelMeta(model);
        let parser = new QueryParser(manager);
        let queryNode = parser.getQueryNodeForQuery(meta.ctor, options.where);
        let query = new InMemoryQuery(queryNode);

        let modelStorage = this._getModelStorage(meta);
        let updateCount = 0;
        for (let record of modelStorage) {
            if (query.testRecord(record)) {
                this._writeFields(manager, 'update', model, meta, record, options.fields);
                updateCount++;
            }
        }
        result.setMeta({ totalCount: updateCount });
        return result;
    }

    async read<T extends IModel>(
            manager: IModelManager,
            model: new(...args: any[]) => T,
            options: IReadOptions,
            result: ModelOperationResult<T, IReadMeta>): Promise<ModelOperationResult<T, IReadMeta>> {

        if (this.OPERATION_DELAY) {
            await sleep(this.OPERATION_DELAY);
        }

        let meta = manager.getModelMeta(model);
        let modelStorage = this._getModelStorage(meta);
        let parser = new QueryParser(manager);
        let queryNode = parser.getQueryNodeForQuery(model, options.where);
        let query = new InMemoryQuery(queryNode);

        const primaryKeyValues: any[] = [];
        const foreignKeyValues: IForeignKeyValues = {};
        const rawValues: IRawValues = [];

        const relatedFieldNames = this._getOwnRelatedFieldNames(options);

        // Populate scalar values and cache related model information
        result.results = [];
        for (let record of modelStorage) {

            if (query.testRecord(record)) {

                let modelInstance = manager.hydrate(model, record);
                result.results.push(modelInstance);
                primaryKeyValues.push(modelInstance[meta.primaryKey]);

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

                if (options.rawValues) {
                    let rawValueObj = {};
                    for (let fieldName of options.rawValues) {
                        rawValueObj[fieldName] = record[fieldName];
                    }
                    rawValues.push(rawValueObj);
                }
            }
        }

        if (relatedFieldNames) {
            // Get related record data
            const related = await Promise.all([
                this._getRelatedModelInstances(manager, meta, foreignKeyValues, options),
                this._getRelatedModelListInstances(manager, meta, primaryKeyValues, options)
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
                    }
                    else if (field instanceof RelatedModelListField) {
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
            result.setMeta({ rawValues: rawValues });
        }
        if (options.orderBy) {
            result.results = sortRecords(result.results, options.orderBy) as T[];
            result.setMeta({ orderBy: options.orderBy });
        }
        result.setMeta({
            offset: options.offset,
            limit: options.limit,
            totalCount: result.results.length
        });
        result.results = result.results.slice(
            result.meta.offset,
            result.meta.offset + result.meta.limit);

        return result;
    }

    async remove<T extends IModel>(
            manager: IModelManager,
            model: T,
            options: IRemoveOptions,
            result: ModelOperationResult<T, IRemoveMeta>): Promise<ModelOperationResult<T, IRemoveMeta>> {

        if (!options.where) {
            throw new Error('remove() requires the \'where\' option to be set');
        }

        if (this.OPERATION_DELAY) {
            await sleep(this.OPERATION_DELAY);
        }

        let meta = manager.getModelMeta(model);
        let parser = new QueryParser(manager);
        let queryNode = parser.getQueryNodeForQuery(meta.ctor, options.where);
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

    async exec<R>(manager: IModelManager, model: IModel, options: IExecOptions, result: ModelOperationResult<R, IExecMeta>): Promise<ModelOperationResult<R, IExecMeta>> {
        return Promise.reject(new Error('InMemoryBackend.exec() not supported'));
    }

    _getModelStorage(meta: IModelMeta<any>): any {
        if (!this._storage[meta.name]) {
            this._storage[meta.name] = [];
        }
        return this._storage[meta.name];
    }

    _setModelStorage(meta: IModelMeta<any>, data: any[]): any {
        this._storage[meta.name] = data;
    }

    _getNextSequence(meta: IModelMeta<any>, field: string) {
        if (!this._sequences[meta.name]) {
            this._sequences[meta.name] = {};
        }
        if (!this._sequences[meta.name][field]) {
            this._sequences[meta.name][field] = 0;
        }
        return ++this._sequences[meta.name][field];
    }

    _writeFields<T extends IModel>(manager: IModelManager, operation: string, model: T, meta: IModelMeta<any>, target: any, fields?: string[]): void {
        let fieldList = fields ? fields : Object.keys(meta.fieldsByName);
        for (let fieldName of fieldList) {

            let field = meta.fieldsByName[fieldName];
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

    _getOwnRelatedFieldNames(options: IReadOptions) {
        return options.related && options.related.map((fieldName) => {
            return fieldName.split('.')[0];
        });
    }

    _getChildRelatedFieldNames(options: IReadOptions, parent: string) {
        if (options.related) {
            let childRelatedFields: string[] = [];
            options.related.forEach((fieldName) => {
                let tokens = fieldName.split('.');
                if (tokens.length > 1 && tokens[0] == parent) {
                    childRelatedFields.push(tokens.slice(1).join('.'));
                }
            });
            return childRelatedFields;
        }
    }

    private async _getRelatedModelInstances(manager: IModelManager, meta: IModelMeta<any>, foreignKeyValues: IForeignKeyValues, options: IReadOptions) {

        const foreignKeyFields: string[] = [];
        const foreignKeyPKFields: string[] = [];
        const foreignKeyPromises: Array<Promise<IModelOperationResult<any, any>>> = [];

        for (let fieldName in foreignKeyValues) {
            if (foreignKeyValues[fieldName].length > 0) {
                let field = meta.fieldsByName[fieldName] as RelatedModelField;
                let relatedMeta = manager.getModelMeta(field.options.model);
                let readOptions: IReadOptions = {
                    limit: foreignKeyValues[fieldName].length,
                    related: this._getChildRelatedFieldNames(options, fieldName)
                };

                foreignKeyFields.push(fieldName);
                foreignKeyPKFields.push(relatedMeta.primaryKey);
                foreignKeyPromises.push(
                    manager.read(
                        relatedMeta.ctor,
                        {
                            where: {
                                [relatedMeta.primaryKey]: { _in: foreignKeyValues[fieldName] }
                            },
                            ...readOptions
                        }
                    ));
            }
        }

        const relatedModelInstances: IRelatedModelInstances = {};

        let results = await Promise.all(foreignKeyPromises);
        foreignKeyFields.forEach((fieldName, i) => {
            relatedModelInstances[fieldName] = {};
            for (let instance of results[i].results) {
                relatedModelInstances[fieldName][instance[foreignKeyPKFields[i]]] = instance;
            }
        });

        return relatedModelInstances;
    }

    private async _getRelatedModelListInstances(manager: IModelManager, meta: IModelMeta<any>, primaryKeyValues: string[], options: IReadOptions) {

        const modelListFields: string[] = [];
        const modelListFieldFKs: string[] = [];
        const modelListFieldPromises: Array<Promise<IModelOperationResult<any, any>>> = [];
        const relatedFieldNames = this._getOwnRelatedFieldNames(options);

        for (let fieldName of relatedFieldNames) {
            let field = meta.fieldsByName[fieldName];
            if (field instanceof RelatedModelListField) {
                let relatedMeta = manager.getModelMeta(field.options.model);
                let readOptions: IReadOptions = {
                    // NOTE: Number of results limited to the default number of results
                    rawValues: [field.options.field],
                    related: this._getChildRelatedFieldNames(options, fieldName)
                };
                modelListFields.push(fieldName);
                modelListFieldFKs.push(field.options.field);
                modelListFieldPromises.push(
                    manager.read(
                        relatedMeta.ctor,
                        {
                            where: {
                                [field.options.field]: { _in: primaryKeyValues }
                            },
                            ...readOptions
                        }
                    ));
            }
        }

        const relatedModelListInstances: IRelatedModelListInstances = {};

        let results = await Promise.all(modelListFieldPromises);
        modelListFields.forEach((fieldName, i) => {
            relatedModelListInstances[fieldName] = {};
            results[i].results.forEach((instance, resultIdx) => {
                let fkValue = results[i].meta.rawValues[resultIdx][modelListFieldFKs[i]];
                if (!relatedModelListInstances[fieldName][fkValue]) {
                    relatedModelListInstances[fieldName][fkValue] = [];
                }
                relatedModelListInstances[fieldName][fkValue].push(instance);
            });
        });

        return relatedModelListInstances;
    }

}
