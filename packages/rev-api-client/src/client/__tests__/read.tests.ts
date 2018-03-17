
import { expect } from 'chai';

import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from 'axios';
import { getMockHttpClient } from '../__test_utils__/mockHttpClient';
import { backendWithMockApi } from '../__test_utils__/mockApiProxy';
import { ModelApiBackend } from '../backend';
import { getModelManager, Comment, Post } from '../__fixtures__/models';
import { ModelManager, ModelOperationResult } from 'rev-models';
import { IReadMeta, IReadOptions } from 'rev-models/lib/models/types';
import { posts, users, createData } from '../__fixtures__/modeldata';

describe('ModelApiBackend - read()', () => {

    let manager: ModelManager;
    let apiBackend: ModelApiBackend;
    let readOptions: IReadOptions;
    let readResult: ModelOperationResult<any, IReadMeta>;

    async function setup(options: {
        responseType: 'rev-api' | 'mock',
        mockResponse?: AxiosResponse<any>
    }) {
        manager = getModelManager();
        await createData(manager);
        if (options.responseType == 'rev-api') {
            apiBackend = backendWithMockApi(new ModelApiBackend('/api'));
        }
        else {
            const mockHttpClient = getMockHttpClient(options.mockResponse);
            apiBackend = new ModelApiBackend('/api', mockHttpClient);
        }
        readOptions = {
            where: {},
            offset: 0,
            limit: 20
        };
        readResult = new ModelOperationResult<Comment, IReadMeta>({operationName: 'read'});
    }

    beforeEach(async () => {
        await setup({ responseType: 'rev-api' });
    });

    it('reads all scalar fields from graphql api (Comments)', async () => {
        const result = await apiBackend.read(
            manager, Comment, readOptions, readResult
        );
        expect(result.success).to.be.true;
        expect(result.results).to.deep.equal([
            { id: 1, comment: 'I totally agree' },
            { id: 2, comment: 'Sweet!' }
        ]);
        expect(result.results[0]).to.be.instanceof(Comment);
        expect(result.results[1]).to.be.instanceof(Comment);
    });

    it('reads all scalar fields from graphql api (Posts)', async () => {
        const result = await apiBackend.read(
            manager, Post, readOptions, readResult
        );
        expect(result.success).to.be.true;
        expect(result.results[0]).to.be.instanceof(Post);
        expect(result.results[1]).to.be.instanceof(Post);
        expect(result.results[2]).to.be.instanceof(Post);
        expect(result.results[0]).to.include({
            id: 1, title: 'RevJS v1.0.0 Released!'
        });
        expect(result.results[1]).to.include({
            id: 2, title: 'JavaScript is Awesome'
        });
        expect(result.results[2]).to.include({
            id: 3, title: 'Ruby Sucks'
        });
    });

    it('RelatedModelFields are not returned by default', async () => {
        const result = await apiBackend.read(
            manager, Post, readOptions, readResult
        );
        expect(result.success).to.be.true;
        expect(result.results[0]).to.be.instanceof(Post);
        expect(result.results[1]).to.be.instanceof(Post);
        expect(result.results[2]).to.be.instanceof(Post);
        expect(result.results[0].user).to.be.undefined;
        expect(result.results[1].user).to.be.undefined;
        expect(result.results[2].user).to.be.undefined;
    });

    it('RelatedModelListFields are not returned by default', async () => {
        const result = await apiBackend.read(
            manager, Post, readOptions, readResult
        );
        expect(result.success).to.be.true;
        expect(result.results[0]).to.be.instanceof(Post);
        expect(result.results[1]).to.be.instanceof(Post);
        expect(result.results[2]).to.be.instanceof(Post);
        expect(result.results[0].comments).to.be.undefined;
        expect(result.results[1].comments).to.be.undefined;
        expect(result.results[2].comments).to.be.undefined;
    });

    it('returns read metadata', async () => {
        const result = await apiBackend.read(
            manager, Post, {
                where: {},
                offset: 0,
                limit: 10
            }, readResult);
        expect(result.success).to.be.true;
        expect(result.meta).to.deep.equal({
            offset: 0,
            limit: 10,
            totalCount: 3
        });
    });

    it('where clause works as expected', async () => {
        const result = await apiBackend.read(
            manager, Post, {
                where: {
                    id: 3
                },
                offset: 0,
                limit: 10
            }, readResult
        );
        expect(result.success).to.be.true;
        expect(result.results).to.have.length(1);
        expect(result.results[0]).to.be.instanceof(Post);
        expect(result.results[0]).to.include({
            id: 3, title: 'Ruby Sucks'
        });
    });

    it('offset and limit options work as expected', async () => {
        const result = await apiBackend.read(
            manager, Post, {
                where: {},
                offset: 1,
                limit: 1
            }, readResult
        );
        expect(result.success).to.be.true;
        expect(result.results).to.have.length(1);
        expect(result.results[0]).to.be.instanceof(Post);
        expect(result.results[0]).to.include({
            id: 2, title: 'JavaScript is Awesome'
        });
    });

    it('orderBy option work as expected', async () => {
        const result = await apiBackend.read(
            manager, Post, {
                where: {},
                offset: 0,
                limit: 10,
                orderBy: ['title desc', 'body']
            }, readResult
        );
        expect(result.success).to.be.true;
        expect(result.results).to.have.length(3);
        expect(result.results[0]).to.be.instanceof(Post);
        expect(result.results[1]).to.be.instanceof(Post);
        expect(result.results[2]).to.be.instanceof(Post);
        expect(result.results[0]).to.include({
            id: 3, title: 'Ruby Sucks',
        });
        expect(result.results[1]).to.include({
            id: 1, title: 'RevJS v1.0.0 Released!',
        });
        expect(result.results[2]).to.include({
            id: 2, title: 'JavaScript is Awesome'
        });
    });

    it('throws error with received data if response is empty', async () => {
        const mockResponse: AxiosResponse = {
            data: null,
            status: 200, statusText: '', headers: {}, config: {}
        };
        await setup({ responseType: 'mock', mockResponse: mockResponse });

        return apiBackend.read(manager, Comment, readOptions, readResult)
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
        await setup({ responseType: 'mock', mockResponse: mockResponse });

        return apiBackend.read(manager, Comment, readOptions, readResult)
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
        await setup({ responseType: 'mock', mockResponse: mockResponse });

        return apiBackend.read(manager, Comment, readOptions, readResult)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('GraphQL response did not contain the expected model results');
                expect(err.response).to.equal(mockResponse);
            });
    });

    it('throws error with received data if response does not contain the expected model results', async () => {
        const mockResponse: AxiosResponse = {
            data: {
                data: {
                    Users: {
                        results: []
                    }
                }
            },
            status: 200, statusText: '', headers: {}, config: {}
        };
        await setup({ responseType: 'mock', mockResponse: mockResponse });

        return apiBackend.read(manager, Comment, readOptions, readResult)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('GraphQL response did not contain the expected model results');
                expect(err.response).to.equal(mockResponse);
            });
    });
});
