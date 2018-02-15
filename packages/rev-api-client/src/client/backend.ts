
import { IModel, ModelManager, fields } from 'rev-models';
import axios, { AxiosRequestConfig, AxiosPromise, AxiosResponse } from 'axios';

import { IBackend } from 'rev-models/lib/backends/backend';
import { ModelOperationResult } from 'rev-models/lib/operations/operationresult';
import {
    ICreateMeta, ICreateOptions, IUpdateMeta, IUpdateOptions, IRemoveMeta,
    IRemoveOptions, IReadMeta, IReadOptions, IExecMeta, IExecOptions, IModelMeta
} from 'rev-models/lib/models/types';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

export class ModelApiBackend implements IBackend {

    constructor(
        private apiUrl: string,
        private _httpClient?: (config: AxiosRequestConfig) => AxiosPromise
    ) {
        if (!this.apiUrl) {
            throw new Error('ModelApiBackend Error: You must provide an apiUrl');
        }
        if (!this._httpClient) {
            this._httpClient = axios;
        }
    }

    async _getGraphQLQueryResult(query: object) {
        const httpResult = await this._httpClient({
            url: this.apiUrl,
            method: 'POST',
            data: { query: jsonToGraphQLQuery(query) }
        });
        if (!httpResult.data) {
            throw this._createHttpError('Received no data from the API', httpResult);
        }
        if (httpResult.data.errors) {
            throw this._createHttpError('GraphQL errors were returned', httpResult);
        }
        return httpResult;
    }

    _createHttpError(message: string, response: AxiosResponse) {
        const error = new Error(message);
        error.response = response;
        return error;
    }

    _buildGraphQLQuery(meta: IModelMeta<any>, where: object, offset: number, limit: number) {
        const fieldObj: any = {};
        for (const field of meta.fields) {
            if (!(field instanceof fields.RelatedModelFieldBase)) {
                fieldObj[field.name] = true;
            }
        }
        return {
            query: {
                [meta.name]: {
                    __args: {
                        where,
                        offset,
                        limit
                    },
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

    _buildGraphQLModelData(manager: ModelManager, meta: IModelMeta<any>, model: IModel) {
        const data = {};
        meta.fields.forEach((field) => {
            if (typeof model[field.name] != 'undefined') {
                data[field.name] = field.toBackendValue(manager, model[field.name]);
            }
        });
        return data;
    }

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

    async update<T extends IModel>(manager: ModelManager, model: T, options: IUpdateOptions, result: ModelOperationResult<T, IUpdateMeta>): Promise<ModelOperationResult<T, IUpdateMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

    async remove<T extends IModel>(manager: ModelManager, model: T, options: IRemoveOptions, result: ModelOperationResult<T, IRemoveMeta>): Promise<ModelOperationResult<T, IRemoveMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

    async read<T extends IModel>(manager: ModelManager, model: new() => T, options: IReadOptions, result: ModelOperationResult<T, IReadMeta>): Promise<ModelOperationResult<T, IReadMeta>> {
        const meta = manager.getModelMeta(model);
        const query = this._buildGraphQLQuery(meta, options.where, options.offset, options.limit);
        const httpResult = await this._getGraphQLQueryResult(query);
        if (!httpResult.data.data
            || !httpResult.data.data[meta.name]
            || !(httpResult.data.data[meta.name].results instanceof Array)) {
            throw this._createHttpError('GraphQL response did not contain the expected model results', httpResult);
        }
        const returnedData = httpResult.data.data[meta.name].results;
        result.results = [];
        returnedData.forEach((record: any) => {
            result.results.push(manager.hydrate(model, record));
        });
        const returnedMeta = httpResult.data.data[meta.name].meta;
        result.setMeta(returnedMeta);
        return result;
    }

    async exec<R>(manager: ModelManager, model: IModel, options: IExecOptions, result: ModelOperationResult<R, IExecMeta>): Promise<ModelOperationResult<R, IExecMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

}
