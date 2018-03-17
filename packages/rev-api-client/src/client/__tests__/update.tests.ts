
import { expect } from 'chai';

import { AxiosResponse } from 'axios';
import { getMockHttpClient } from '../__test_utils__/mockHttpClient';
import { backendWithMockApi } from '../__test_utils__/mockApiProxy';
import { ModelApiBackend } from '../backend';
import { getModelManager, Comment, Post } from '../__fixtures__/models';
import { ModelManager, ModelOperationResult } from 'rev-models';
import { IUpdateOptions, IUpdateMeta } from 'rev-models/lib/models/types';
import { posts, createData } from '../__fixtures__/modeldata';

describe('ModelApiBackend - update()', () => {

    let manager: ModelManager;
    let apiBackend: ModelApiBackend;
    let updateOptions: IUpdateOptions;
    let updateResult: ModelOperationResult<any, IUpdateMeta>;

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
        updateOptions = {};
        updateResult = new ModelOperationResult<Comment, IUpdateMeta>({operationName: 'update'});
    }

    beforeEach(async () => {
        await setup({ responseType: 'rev-api' });
    });

    it('can update a record with scalar values', async () => {
        const post = new Post({
            id: 3,
            title: 'Ruby is kinda ok, but not really',
            published: true
        });
        const result = await apiBackend.update(
            manager, post, updateOptions, updateResult
        );
        expect(result.success).to.be.true;
        expect(result.validation).to.be.an('object');
        expect(result.validation.valid).to.be.true;
        expect(result.results).to.be.undefined;
        expect(result.result).to.be.undefined;
        expect(result.meta).to.deep.equal({
            totalCount: 1
        });
    });

    it('returns an unsuccessful result with error details if validation errors occur', async () => {
        const post = new Post({
            id: 1,
            post_date: 'not a date'
        });
        const result = await apiBackend.update(
            manager, post, updateOptions, updateResult
        );
        expect(result.success).to.be.false;
        expect(result.validation).to.be.an('object');
        expect(result.validation.valid).to.be.false;
        expect(result.validation.fieldErrors['post_date']).to.deep.equal([
            { message: 'post_date should be a date and time', code: 'not_a_datetime' }
        ]);
        expect(result.results).to.be.undefined;
        expect(result.result).to.be.undefined;
    });

    it('can use the "where" option to update multiple records', async () => {
        const post = new Post({
            title: 'Lots of overwritten titles...',
        });
        const result = await apiBackend.update(
            manager, post, {
                where: {
                    published: true
                }
            }, updateResult
        );
        expect(result.success).to.be.true;
        expect(result.validation).to.be.an('object');
        expect(result.validation.valid).to.be.true;
        expect(result.results).to.be.undefined;
        expect(result.result).to.be.undefined;
        expect(result.meta).to.deep.equal({
            totalCount: 2
        });
    });

    it('using the "fields" option restricts the update to the specified fields', async () => {
        const updatedText = 'This field should be updated';
        const post = new Post({
            id: 3,
            title: 'This should not be updated',
            body: updatedText,
            post_date: 'This should also be ignored...'
        });
        const result = await apiBackend.update(
            manager, post, {
                fields: ['body']
            }, updateResult
        );
        expect(result.success).to.be.true;
        expect(result.meta).to.deep.equal({
            totalCount: 1
        });
        const updatedPost = (await manager.read(Post, { where: { id: 3 }})).results[0];
        expect(updatedPost.id).to.equal(posts[2].id);
        expect(updatedPost.title).to.equal(posts[2].title);
        expect(updatedPost.body).to.equal(updatedText);
        expect(updatedPost.post_date).to.equal(posts[2].post_date);
    });

    it('throws error with received data if response is empty', async () => {
        const mockResponse: AxiosResponse = {
            data: null,
            status: 200, statusText: '', headers: {}, config: {}
        };
        await setup({ responseType: 'mock', mockResponse: mockResponse });

        return apiBackend.update(manager, new Comment(), updateOptions, updateResult)
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

        return apiBackend.update(manager, new Comment(), updateOptions, updateResult)
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

        return apiBackend.update(manager, new Comment(), updateOptions, updateResult)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('GraphQL response did not contain the expected operation results');
                expect(err.response).to.equal(mockResponse);
            });
    });

});
