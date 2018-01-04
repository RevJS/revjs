
import { expect } from 'chai';

import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from 'axios';
import { getMockApiHttpClient, getMockHttpClient } from '../__test_utils__/mockHttpClient';
import { ModelApiBackend } from '../backend';
import { getModelManager, Comment, Post } from '../__fixtures__/models';
import { ModelManager, ModelOperationResult } from 'rev-models';
import { IReadMeta, IReadOptions } from 'rev-models/lib/models/types';
import { expectToHaveProperties } from '../__test_utils__/utils';

describe('ModelApiBackend - read()', () => {

    let manager: ModelManager;
    let mockHttpClient: (config: AxiosRequestConfig) => AxiosPromise;
    let apiBackend: ModelApiBackend;
    let readOptions: IReadOptions;
    let readResult: ModelOperationResult<any, IReadMeta>;

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
        readOptions = {};
        readResult = new ModelOperationResult<Comment, IReadMeta>({operation: 'read'});
    }

    beforeEach(async () => {
        await setup({ responseType: 'rev-api' });
    });

    it('reads all scalar fields from graphql api (Comments)', async () => {
        const result = await apiBackend.read(
            manager, Comment, {}, readResult, readOptions
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
            manager, Post, {}, readResult, readOptions
        );
        expect(result.success).to.be.true;
        expect(result.results[0]).to.be.instanceof(Post);
        expect(result.results[1]).to.be.instanceof(Post);
        expect(result.results[2]).to.be.instanceof(Post);
        expectToHaveProperties(result.results[0], {
            id: 1, title: 'RevJS v1.0.0 Released!'
        });
        expectToHaveProperties(result.results[1], {
            id: 2, title: 'JavaScript is Awesome'
        });
        expectToHaveProperties(result.results[2], {
            id: 3, title: 'Ruby Sucks'
        });
    });

    it('throws error with received data if response is empty', () => {
        const mockResponse: AxiosResponse = {
            data: null,
            status: 200, statusText: '', headers: {}, config: {}
        };
        setup({ responseType: 'mock', mockResponse: mockResponse });

        return apiBackend.read(manager, Comment, {}, readResult, readOptions)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('received no data from the API');
                expect(err.response).to.equal(mockResponse);
            });
    });

    it('throws error with received data if response does not contain graphql "data" key', () => {
        const mockResponse: AxiosResponse = {
            data: {},
            status: 200, statusText: '', headers: {}, config: {}
        };
        setup({ responseType: 'mock', mockResponse: mockResponse });

        return apiBackend.read(manager, Comment, {}, readResult, readOptions)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('graphql response did not contain the "data" attribute');
                expect(err.response).to.equal(mockResponse);
            });
    });

});
