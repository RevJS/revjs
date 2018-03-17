
import { expect } from 'chai';

import { AxiosResponse } from 'axios';
import { getMockHttpClient } from '../__test_utils__/mockHttpClient';
import { ModelApiBackend } from '../backend';
import { getModelManager, Comment } from '../__fixtures__/models';
import { ModelManager, ModelOperationResult } from 'rev-models';
import { ICreateOptions, ICreateMeta } from 'rev-models/lib/models/types';

describe('ModelApiBackend - create() - graphql response tests', () => {

    let manager: ModelManager;
    let apiBackend: ModelApiBackend;
    let createOptions: ICreateOptions;
    let createResult: ModelOperationResult<any, ICreateMeta>;

    async function setup(mockResponse?: AxiosResponse<any>) {
        manager = getModelManager();
        const mockHttpClient = getMockHttpClient(mockResponse);
        apiBackend = new ModelApiBackend('/api', mockHttpClient);
        createOptions = {};
        createResult = new ModelOperationResult<Comment, ICreateMeta>({operationName: 'create'});
    }

    it('throws error with received data if response is empty', async () => {
        const mockResponse: AxiosResponse = {
            data: null,
            status: 200, statusText: '', headers: {}, config: {}
        };
        await setup(mockResponse);

        return apiBackend.create(manager, new Comment(), createOptions, createResult)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('Received no data from the API');
                expect(err.response).to.equal(mockResponse);
            });
    });

    it('re-throws graphql errors if they have been returned', async () => {
        const mockResponse: AxiosResponse = {
            data: {
                errors: [
                    { message: 'Something broke!' }
                ]
            },
            status: 200, statusText: '', headers: {}, config: {}
        };
        await setup(mockResponse);

        return apiBackend.create(manager, new Comment(), createOptions, createResult)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('GraphQL errors were returned');
                expect(err.response).to.equal(mockResponse);
            });
    });

    it('throws error with received data if response does not contain graphql "data" key', async () => {
        const mockResponse: AxiosResponse = {
            data: {},
            status: 200, statusText: '', headers: {}, config: {}
        };
        await setup(mockResponse);

        return apiBackend.create(manager, new Comment(), createOptions, createResult)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('GraphQL response did not contain the expected operation results');
                expect(err.response).to.equal(mockResponse);
            });
    });

});