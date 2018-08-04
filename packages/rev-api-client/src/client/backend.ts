import { IModel, ModelManager, fields } from 'rev-models';
import axios, { AxiosRequestConfig, AxiosPromise, AxiosResponse } from 'axios';

import { IBackend } from 'rev-models/lib/backends/backend';
import { getOwnRelatedFieldNames, getChildRelatedFieldNames } from 'rev-models/lib/backends/utils';
import { ModelOperationResult } from 'rev-models/lib/operations/operationresult';
import {
    ICreateMeta, ICreateOptions, IUpdateMeta, IUpdateOptions, IRemoveMeta,
    IRemoveOptions, IReadMeta, IReadOptions, IExecMeta, IExecOptions, IModelMeta
} from 'rev-models/lib/models/types';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { IObject } from 'rev-models/lib/utils/types';

/**
 * A RevJS Backend class that stores and retrieves data from a GraphQL API
 * created by the `rev-api` module of RevJS
 *
 * Usage example:
 *
 * ```ts
 * [[include:examples/src/using_backends/using_an_api_backend.ts]]
 * ```
 */
export class ModelApiBackend implements IBackend {

    /**
     * Creates a rev-api client backend.
     *
     * @param apiUrl The URL of the GraphQL API. Can be a relative or absolute URL
     * @param _httpClient You can optionally override the HTTP Client used by the
     * backend. This must be an axios-compatible client. If not specified then
     * axios is used.
     */

    apiUrl: string;
    _httpClient: (config: AxiosRequestConfig) => AxiosPromise;

    constructor(
        apiUrl: string,
        httpClient?: (config: AxiosRequestConfig) => AxiosPromise
    ) {
        if (!apiUrl) {
            throw new Error('ModelApiBackend Error: You must provide an apiUrl');
        }
        this.apiUrl = apiUrl;
        this._httpClient = httpClient || axios;
    }

    /**
     * @private
     */
    async create<T extends IModel>(manager: ModelManager, model: T, options: ICreateOptions, result: ModelOperationResult<T, ICreateMeta>): Promise<ModelOperationResult<T, ICreateMeta>> {
        const meta = manager.getModelMeta(model);
        const data = this._buildGraphQLModelData(manager, meta, model);
        const mutationName = meta.name + '_create';
        const query = {
            mutation: {
                [mutationName]: {
                    __args: {
                        model: data
                    }
                }
            }
        };
        const httpResult = await this._getGraphQLQueryResult(query);
        if (!httpResult.data.data
            || !httpResult.data.data[mutationName]) {
            throw this._createHttpError('GraphQL response did not contain the expected operation results', httpResult);
        }
        const createResult: ModelOperationResult<any, ICreateMeta> = httpResult.data.data[mutationName];
        result.success = createResult.success;
        result.validation = createResult.validation;
        if (createResult.result) {
            result.result = manager.hydrate(meta.ctor, createResult.result);
        }
        return result;
    }

    /**
     * @private
     */
    async update<T extends IModel>(manager: ModelManager, model: T, options: IUpdateOptions, result: ModelOperationResult<T, IUpdateMeta>): Promise<ModelOperationResult<T, IUpdateMeta>> {

        if (!options.where) {
            throw new Error(`update() requires the 'where' option to be set.`);
        }

        const meta = manager.getModelMeta(model);
        const data = this._buildGraphQLModelData(manager, meta, model, options.fields);
        const mutationName = meta.name + '_update';
        let args: any = {
            model: data
        };
        if (options.where) {
            args.where = options.where;
        }
        const query = {
            mutation: {
                [mutationName]: {
                    __args: args
                }
            }
        };
        const httpResult = await this._getGraphQLQueryResult(query);
        if (!httpResult.data.data
            || !httpResult.data.data[mutationName]) {
            throw this._createHttpError('GraphQL response did not contain the expected operation results', httpResult);
        }
        const updateResult: ModelOperationResult<any, IUpdateMeta> = httpResult.data.data[mutationName];
        result.success = updateResult.success;
        result.validation = updateResult.validation;
        result.meta = updateResult.meta;
        return result;
    }

    /**
     * @private
     */
    async remove<T extends IModel>(manager: ModelManager, model: T, options: IRemoveOptions, result: ModelOperationResult<T, IRemoveMeta>): Promise<ModelOperationResult<T, IRemoveMeta>> {

        if (!options.where) {
            throw new Error(`remove() requires the 'where' option to be set.`);
        }

        const meta = manager.getModelMeta(model);
        const mutationName = meta.name + '_remove';
        // options.where should be set, assuming we are called from ModelManager
        const query = {
            mutation: {
                [mutationName]: {
                    __args: {
                        where: options.where
                    }
                }
            }
        };
        const httpResult = await this._getGraphQLQueryResult(query);
        if (!httpResult.data.data
            || !httpResult.data.data[mutationName]) {
            throw this._createHttpError('GraphQL response did not contain the expected operation results', httpResult);
        }
        const removeResult: ModelOperationResult<any, IRemoveMeta> = httpResult.data.data[mutationName];
        result.success = removeResult.success;
        result.meta = removeResult.meta;
        return result;
    }

    /**
     * @private
     */
    async read<T extends IModel>(manager: ModelManager, model: new() => T, options: IReadOptions, result: ModelOperationResult<T, IReadMeta>): Promise<ModelOperationResult<T, IReadMeta>> {
        const meta = manager.getModelMeta(model);
        const query = this._buildGraphQLQuery(manager, meta, options);
        const httpResult = await this._getGraphQLQueryResult(query);
        if (!httpResult.data.data
            || !httpResult.data.data[meta.name]
            || !(httpResult.data.data[meta.name].results instanceof Array)) {
            throw this._createHttpError('GraphQL response did not contain the expected model results', httpResult);
        }
        const returnedData = httpResult.data.data[meta.name].results;
        result.results = [];
        returnedData.forEach((record: any) => {
            result.results!.push(this._hydrateRecordWithRelated(manager, meta, record, options.related));
        });
        const returnedMeta = httpResult.data.data[meta.name].meta;
        result.setMeta(returnedMeta);
        return result;
    }

    /**
     * @private
     */
    async exec<R>(manager: ModelManager, model: IModel, options: IExecOptions, result: ModelOperationResult<R, IExecMeta>): Promise<ModelOperationResult<R, IExecMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

    private async _getGraphQLQueryResult(query: object) {
        const httpResult = await this._httpClient({
            url: this.apiUrl,
            method: 'POST',
            data: { query: jsonToGraphQLQuery(query) }
        });
        if (!httpResult.data) {
            throw this._createHttpError('Received no data from the API', httpResult);
        }
        if (httpResult.data.errors) {
            let message = 'GraphQL errors were returned';
            if (httpResult.data.errors[0] && httpResult.data.errors[0].message) {
                message += ': ' + httpResult.data.errors[0].message;
            }
            throw this._createHttpError(message, httpResult);
        }
        return httpResult;
    }

    private _createHttpError(message: string, response: AxiosResponse) {
        const error = new Error(message);
        error.response = response;
        return error;
    }

    /**
     * Builds an object representing all the graphql nodes to select for the specified query
     */
    private _buildGraphQLSelectFields(manager: ModelManager, meta: IModelMeta<any>, fieldObj: any, related?: string[]) {
        for (const field of meta.fields) {
            if (field instanceof fields.RelatedModelFieldBase) {
                if (related) {
                    // If this field is a RelatedModel field and it is in the list of "related" fields to select, then
                    // select the field and all of its child scalar fields
                    const relFieldNames = getOwnRelatedFieldNames(related);
                    if (field instanceof fields.RelatedModelFieldBase && relFieldNames.indexOf(field.name) > -1) {
                        const relMeta = manager.getModelMeta(field.options.model);
                        fieldObj[field.name] = {};
                        const childRelFieldNames = getChildRelatedFieldNames(field.name, related);
                        this._buildGraphQLSelectFields(manager, relMeta, fieldObj[field.name], childRelFieldNames);
                    }
                }
            }
            else {
                fieldObj[field.name] = true;
            }
        }
        return fieldObj;
    }

    private _buildGraphQLQuery(manager: ModelManager, meta: IModelMeta<any>, options: IReadOptions) {
        const fieldObj = this._buildGraphQLSelectFields(manager, meta, {}, options.related);
        const readOptions: IReadOptions = {
            where: options.where,
            offset: options.offset,
            limit: options.limit
        };
        if (options.orderBy) {
            readOptions.orderBy = options.orderBy;
        }
        return {
            query: {
                [meta.name]: {
                    __args: readOptions,
                    results: fieldObj,
                    meta: {
                        offset: true,
                        limit: true,
                        totalCount: true
                    }
                }
            }
        };
    }

    private _buildGraphQLModelData(manager: ModelManager, meta: IModelMeta<any>, model: IModel, fieldNames?: string[]) {
        const data: IObject = {};
        meta.fields.forEach((field) => {
            if (field.options.stored
                && (!fieldNames || fieldNames.indexOf(field.name) > -1)
                && typeof model[field.name] != 'undefined'
            ) {
                data[field.name] = field.toBackendValue(manager, model[field.name]);
            }
        });
        return data;
    }

    private _hydrateRecordWithRelated(manager: ModelManager, meta: IModelMeta<any>, recordData: any, related?: string[]) {
        const model = manager.hydrate(meta.ctor, recordData);
        if (related) {
            const relFieldNames = getOwnRelatedFieldNames(related);
            meta.fields.forEach((field) => {
                if (relFieldNames.indexOf(field.name) > -1 && typeof recordData[field.name] != 'undefined') {

                    const relMeta = manager.getModelMeta(field.options.model);
                    const childRelFieldNames = getChildRelatedFieldNames(field.name, related);

                    if (field instanceof fields.RelatedModelField) {
                        if (recordData[field.name] == null) {
                            model[field.name] = null;
                        }
                        else {
                            model[field.name] = this._hydrateRecordWithRelated(manager, relMeta, recordData[field.name], childRelFieldNames);
                        }
                    }
                    else if (field instanceof fields.RelatedModelListField && recordData[field.name] instanceof Array) {
                        model[field.name] = [];
                        recordData[field.name].forEach((record: any) => {
                            model[field.name].push(this._hydrateRecordWithRelated(manager, relMeta, record, childRelFieldNames));
                        });
                    }
                }
            });
        }
        return model;
    }

}
