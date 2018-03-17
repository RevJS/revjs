
import { ModelApiManager, GraphQLApi } from 'rev-api';
import { graphql } from 'graphql';
import { ModelManager } from 'rev-models';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ExecutionResult } from 'graphql/execution/execute';

/**
 * Returns a mock axios function with a fixed http response
 * @param mockResponse
 */
export function getMockHttpClient(mockResponse: AxiosResponse<any>) {
    return async (config: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
        return mockResponse;
    };
}

/**
 * Returns a mock axios function which makes actual graphql queries against
 * any models defined in the passed modelManager
 * @param modelManager
 */
export function getMockApiHttpClient(modelManager: ModelManager) {

    const apiManager = new ModelApiManager(modelManager);

    const modelNames = modelManager.getModelNames();
    modelNames.forEach((modelName) => {
        const meta = modelManager.getModelMeta(modelName);
        apiManager.register(meta.ctor, { operations: ['create', 'read', 'update', 'remove']});
    });

    const api = new GraphQLApi(apiManager);
    const schema = api.getSchema();

    return async (config: AxiosRequestConfig): Promise<AxiosResponse<ExecutionResult>> => {
        const queryResult = await graphql(schema, config.data.query);
        return {
            data: queryResult,
            status: 200,
            statusText: '',
            headers: {},
            config: {}
        };
    };
}