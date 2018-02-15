
import { expect } from 'chai';

import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from 'axios';
import { getMockApiHttpClient, getMockHttpClient } from '../__test_utils__/mockHttpClient';
import { ModelApiBackend } from '../backend';
import { getModelManager, Comment, Post } from '../__fixtures__/models';
import { ModelManager, ModelOperationResult } from 'rev-models';
import { IRemoveOptions, IRemoveMeta } from 'rev-models/lib/models/types';

describe('ModelApiBackend - remove()', () => {

    let manager: ModelManager;
    let mockHttpClient: (config: AxiosRequestConfig) => AxiosPromise;
    let apiBackend: ModelApiBackend;
    let removeOptions: IRemoveOptions;
    let removeResult: ModelOperationResult<any, IRemoveMeta>;

    async function setup(options: {
        responseType: 'rev-api' | 'mock',
        mockResponse?: AxiosResponse<any>
    }) {
        manager = getModelManager();
        if (options.responseType == 'rev-api') {
            mockHttpClient = await getMockApiHttpClient(manager);
        }
        else {
            mockHttpClient = getMockHttpClient(options.mockResponse);
        }
        apiBackend = new ModelApiBackend('/api', mockHttpClient);
        removeOptions = {};
        removeResult = new ModelOperationResult<Comment, IRemoveMeta>({operation: 'remove'});
    }

    beforeEach(async () => {
        await setup({ responseType: 'rev-api' });
    });

    it('can remove an existing record', async () => {
        const result = await apiBackend.remove(
            manager, new Post(), {
                where: {
                    id: 3
                }
            }, removeResult
        );
        expect(result.success).to.be.true;
        expect(result.validation).to.be.undefined;
        expect(result.results).to.be.undefined;
        expect(result.result).to.be.undefined;
        expect(result.meta).to.deep.equal({
            totalCount: 1
        });
    });

    it('can use the "where" option to remove multiple records', async () => {
        const result = await apiBackend.remove(
            manager, new Post(), {
                where: {
                    published: true
                }
            }, removeResult
        );
        expect(result.success).to.be.true;
        expect(result.validation).to.be.undefined;
        expect(result.results).to.be.undefined;
        expect(result.result).to.be.undefined;
        expect(result.meta).to.deep.equal({
            totalCount: 2
        });
    });

    it('throws error with received data if response is empty', () => {
        const mockResponse: AxiosResponse = {
            data: null,
            status: 200, statusText: '', headers: {}, config: {}
        };
        setup({ responseType: 'mock', mockResponse: mockResponse });

        return apiBackend.remove(manager, new Comment(), removeOptions, removeResult)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('Received no data from the API');
                expect(err.response).to.equal(mockResponse);
            });
    });

    it('re-throws graphql errors if they have been returned', () => {
        const mockResponse: AxiosResponse = {
            data: {
                errors: [
                    { message: 'Something broke!' }
                ]
            },
            status: 200, statusText: '', headers: {}, config: {}
        };
        setup({ responseType: 'mock', mockResponse: mockResponse });

        return apiBackend.remove(manager, new Comment(), removeOptions, removeResult)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('GraphQL errors were returned');
                expect(err.response).to.equal(mockResponse);
            });
    });

    it('throws error with received data if response does not contain graphql "data" key', () => {
        const mockResponse: AxiosResponse = {
            data: {},
            status: 200, statusText: '', headers: {}, config: {}
        };
        setup({ responseType: 'mock', mockResponse: mockResponse });

        return apiBackend.remove(manager, new Comment(), removeOptions, removeResult)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('GraphQL response did not contain the expected operation results');
                expect(err.response).to.equal(mockResponse);
            });
    });

});
