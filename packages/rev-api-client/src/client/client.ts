
import { IModel, ModelManager } from 'rev-models';
import axios, { AxiosRequestConfig, AxiosPromise } from 'axios';

import { IBackend } from 'rev-models/lib/backends/backend';
import { ModelOperationResult } from 'rev-models/lib/operations/operationresult';
import {
    ICreateMeta, ICreateOptions, IUpdateMeta, IUpdateOptions, IRemoveMeta,
    IRemoveOptions, IReadMeta, IReadOptions, IExecArgs, IExecMeta, IExecOptions
} from 'rev-models/lib/models/types';

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
        const httpResult = await this._httpClient({
            url: this.apiUrl,
            method: 'POST',
            data: `
                query {
                    Comment {
                        results {
                            id,
                            comment
                        }
                    }
                }`
        });
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
