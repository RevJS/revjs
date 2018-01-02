
import { expect } from 'chai';

import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from 'axios';
import { getMockApiHttpClient, getMockHttpClient } from '../__test_utils__/mockHttpClient';
import { ModelApiBackend } from '../client';
import { getModelManager, Comment } from '../__fixtures__/models';
import { ModelManager, ModelOperationResult } from 'rev-models';
import { IReadMeta, IReadOptions } from 'rev-models/lib/models/types';

describe('ModelApiBackend - read()', () => {

    let manager: ModelManager;
    let mockHttpClient: (config: AxiosRequestConfig) => AxiosPromise;
    let apiBackend: ModelApiBackend;
    let readOptions: IReadOptions;
    let readResult: ModelOperationResult<Comment, IReadMeta>;

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

    it('can read scalar data from graphql api', async () => {
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
