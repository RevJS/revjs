
import { IModel, ModelManager, fields } from 'rev-models';
import axios, { AxiosRequestConfig, AxiosPromise, AxiosResponse } from 'axios';

import { IBackend } from 'rev-models/lib/backends/backend';
import { ModelOperationResult } from 'rev-models/lib/operations/operationresult';
import {
    ICreateMeta, ICreateOptions, IUpdateMeta, IUpdateOptions, IRemoveMeta,
    IRemoveOptions, IReadMeta, IReadOptions, IExecArgs, IExecMeta, IExecOptions, IModelMeta
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

    _createHttpError(message: string, response: AxiosResponse) {
        const error = new Error(message);
        error.response = response;
        return error;
    }

    _buildGraphQLQuery(meta: IModelMeta<any>) {
        const fieldObj: any = {};
        for (const field of meta.fields) {
            if (!(field instanceof fields.RelatedModelFieldBase)) {
                fieldObj[field.name] = true;
            }
        }
        return {
            query: {
                [meta.name]: {
                    results: fieldObj
                }
            }
        };
    }

    async create<T extends IModel>(manager: ModelManager, model: T, result: ModelOperationResult<T, ICreateMeta>, options: ICreateOptions): Promise<ModelOperationResult<T, ICreateMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

    async update<T extends IModel>(manager: ModelManager, model: T, where: object, result: ModelOperationResult<T, IUpdateMeta>, options: IUpdateOptions): Promise<ModelOperationResult<T, IUpdateMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

    async remove<T extends IModel>(manager: ModelManager, model: T, where: object, result: ModelOperationResult<T, IRemoveMeta>, options: IRemoveOptions): Promise<ModelOperationResult<T, IRemoveMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

    async read<T extends IModel>(manager: ModelManager, model: new() => T, where: object, result: ModelOperationResult<T, IReadMeta>, options: IReadOptions): Promise<ModelOperationResult<T, IReadMeta>> {
        const meta = manager.getModelMeta(model);
        const query = this._buildGraphQLQuery(meta);
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
        return result;
    }

    async exec<R>(manager: ModelManager, model: IModel, method: string, argObj: IExecArgs, result: ModelOperationResult<R, IExecMeta>, options: IExecOptions): Promise<ModelOperationResult<R, IExecMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

}
