
import { expect } from 'chai';

import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from 'axios';
import { getMockApiHttpClient, getMockHttpClient } from '../__test_utils__/mockHttpClient';
import { ModelApiBackend } from '../backend';
import { getModelManager, Comment, Post } from '../__fixtures__/models';
import { ModelManager, ModelOperationResult } from 'rev-models';
import { expectToHaveProperties } from '../__test_utils__/utils';
import { ICreateOptions, ICreateMeta } from 'rev-models/lib/models/types';
import { posts, users } from '../__fixtures__/modeldata';

describe.only('ModelApiBackend - create()', () => {

    let manager: ModelManager;
    let mockHttpClient: (config: AxiosRequestConfig) => AxiosPromise;
    let apiBackend: ModelApiBackend;
    let createOptions: ICreateOptions;
    let createResult: ModelOperationResult<any, ICreateMeta>;

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
        createOptions = {};
        createResult = new ModelOperationResult<Comment, ICreateMeta>({operation: 'create'});
    }

    beforeEach(async () => {
        await setup({ responseType: 'rev-api' });
    });

    it('can create a new record with scalar and related values (Comments)', async () => {
        const comment = new Comment({
            post: posts[1],
            comment: 'Oh yeah totally man!',
            user: users[1]
        });
        const result = await apiBackend.create(
            manager, comment, createOptions, createResult
        );
        expect(result.success).to.be.true;
        expect(result.results).to.be.undefined;
        expect(result.result).to.be.instanceof(Comment);
        expect(result.result.id).to.be.a('number');
    });

    // it('reads all scalar fields from graphql api (Posts)', async () => {
    //     const result = await apiBackend.create(
    //         manager, Post, createOptions, createResult
    //     );
    //     expect(result.success).to.be.true;
    //     expect(result.results[0]).to.be.instanceof(Post);
    //     expect(result.results[1]).to.be.instanceof(Post);
    //     expect(result.results[2]).to.be.instanceof(Post);
    //     expectToHaveProperties(result.results[0], {
    //         id: 1, title: 'RevJS v1.0.0 Released!'
    //     });
    //     expectToHaveProperties(result.results[1], {
    //         id: 2, title: 'JavaScript is Awesome'
    //     });
    //     expectToHaveProperties(result.results[2], {
    //         id: 3, title: 'Ruby Sucks'
    //     });
    // });

    // it('returns read metadata', async () => {
    //     const result = await apiBackend.create(
    //         manager, Post, {
    //             where: {},
    //             offset: 0,
    //             limit: 10
    //         }, createResult);
    //     expect(result.success).to.be.true;
    //     expect(result.meta).to.deep.equal({
    //         offset: 0,
    //         limit: 10,
    //         totalCount: 3
    //     });
    // });

    // it('where clause works as expected', async () => {
    //     const result = await apiBackend.create(
    //         manager, Post, {
    //             where: {
    //                 id: 3
    //             },
    //             offset: 0,
    //             limit: 10
    //         }, createResult
    //     );
    //     expect(result.success).to.be.true;
    //     expect(result.results).to.have.length(1);
    //     expect(result.results[0]).to.be.instanceof(Post);
    //     expectToHaveProperties(result.results[0], {
    //         id: 3, title: 'Ruby Sucks'
    //     });
    // });

    // it('offset and limit options work as expected', async () => {
    //     const result = await apiBackend.create(
    //         manager, Post, {
    //             where: {},
    //             offset: 1,
    //             limit: 1
    //         }, createResult
    //     );
    //     expect(result.success).to.be.true;
    //     expect(result.results).to.have.length(1);
    //     expect(result.results[0]).to.be.instanceof(Post);
    //     expectToHaveProperties(result.results[0], {
    //         id: 2, title: 'JavaScript is Awesome'
    //     });
    // });

    // it('throws error with received data if response is empty', () => {
    //     const mockResponse: AxiosResponse = {
    //         data: null,
    //         status: 200, statusText: '', headers: {}, config: {}
    //     };
    //     setup({ responseType: 'mock', mockResponse: mockResponse });

    //     return apiBackend.create(manager, Comment, createOptions, createResult)
    //         .then(() => { throw new Error('expected to reject'); })
    //         .catch((err) => {
    //             expect(err.message).to.contain('Received no data from the API');
    //             expect(err.response).to.equal(mockResponse);
    //         });
    // });

    // it('re-throws graphql errors if they have been returned', () => {
    //     const mockResponse: AxiosResponse = {
    //         data: {
    //             errors: [
    //                 { message: 'Something broke!' }
    //             ]
    //         },
    //         status: 200, statusText: '', headers: {}, config: {}
    //     };
    //     setup({ responseType: 'mock', mockResponse: mockResponse });

    //     return apiBackend.create(manager, Comment, createOptions, createResult)
    //         .then(() => { throw new Error('expected to reject'); })
    //         .catch((err) => {
    //             expect(err.message).to.contain('GraphQL errors were returned');
    //             expect(err.response).to.equal(mockResponse);
    //         });
    // });

    // it('throws error with received data if response does not contain graphql "data" key', () => {
    //     const mockResponse: AxiosResponse = {
    //         data: {},
    //         status: 200, statusText: '', headers: {}, config: {}
    //     };
    //     setup({ responseType: 'mock', mockResponse: mockResponse });

    //     return apiBackend.create(manager, Comment, createOptions, createResult)
    //         .then(() => { throw new Error('expected to reject'); })
    //         .catch((err) => {
    //             expect(err.message).to.contain('GraphQL response did not contain the expected model results');
    //             expect(err.response).to.equal(mockResponse);
    //         });
    // });

    // it('throws error with received data if response does not contain the expected model results', () => {
    //     const mockResponse: AxiosResponse = {
    //         data: {
    //             data: {
    //                 Users: {
    //                     results: []
    //                 }
    //             }
    //         },
    //         status: 200, statusText: '', headers: {}, config: {}
    //     };
    //     setup({ responseType: 'mock', mockResponse: mockResponse });

    //     return apiBackend.create(manager, Comment, createOptions, createResult)
    //         .then(() => { throw new Error('expected to reject'); })
    //         .catch((err) => {
    //             expect(err.message).to.contain('GraphQL response did not contain the expected model results');
    //             expect(err.response).to.equal(mockResponse);
    //         });
    // });
});
