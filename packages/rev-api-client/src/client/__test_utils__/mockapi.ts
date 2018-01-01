
import { ModelApiManager, GraphQLApi } from 'rev-api';
import * as models from '../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { ModelManager, fields } from 'rev-models';
import { createData, IModelTestData } from '../__fixtures__/modeldata';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ExecutionResult } from 'graphql/execution/execute';

export async function getMockApiHttpClient(modelManager: ModelManager) {
    const apiManager = new ModelApiManager(modelManager);
    apiManager.register(models.Post, { operations: ['read'] });
    apiManager.register(models.User, { operations: ['read'] });
    apiManager.register(models.Comment, { operations: ['read'] });
    const api = new GraphQLApi(apiManager);

    await createData(modelManager);

    const schema = api.getSchema();

    return async (config: AxiosRequestConfig): Promise<AxiosResponse<ExecutionResult>> => {
        const queryResult = await graphql(schema, config.data);
        return {
            data: queryResult,
            status: 200,
            statusText: '',
            headers: {},
            config: {}
        };
    };
}