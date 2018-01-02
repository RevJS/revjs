
import { IModel, ModelManager } from 'rev-models';
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

    _objectToGraphQLQuery(queryObject: any) {

    }

    _createGraphQLQuery(meta: IModelMeta<any>) {

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
        let meta = manager.getModelMeta(model);
        let query = {
            query: {
                [meta.name]: {
                    results: {
                        id: true,
                        comment: true
                    }
                }
            }
        };
        const httpResult = await this._httpClient({
            url: this.apiUrl,
            method: 'POST',
            data: jsonToGraphQLQuery(query)
        });
        if (!httpResult.data) {
            throw this._createHttpError('received no data from the API', httpResult);
        }
        if (!httpResult.data.data) {
            throw this._createHttpError('graphql response did not contain the "data" attribute', httpResult);
        }
        const returnedData = httpResult.data.data.Comment.results;
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
