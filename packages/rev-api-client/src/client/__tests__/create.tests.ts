
import { expect } from 'chai';

import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from 'axios';
import { getMockApiHttpClient, getMockHttpClient } from '../__test_utils__/mockHttpClient';
import { ModelApiBackend } from '../backend';
import { getModelManager, Comment, Post } from '../__fixtures__/models';
import { ModelManager, ModelOperationResult } from 'rev-models';
import { ICreateOptions, ICreateMeta } from 'rev-models/lib/models/types';
import { posts, users } from '../__fixtures__/modeldata';

describe('ModelApiBackend - create()', () => {

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
        expect(result.validation).to.be.an('object');
        expect(result.validation.valid).to.be.true;
        expect(result.results).to.be.undefined;
        expect(result.result).to.be.instanceof(Comment);
        expect(result.result.id).to.be.a('number');
        expect(result.result.comment).to.equal(comment.comment);
    });

    it('can create a new record with scalar and related values (Post)', async () => {
        const post = new Post({
            title: 'Wicked post via the API',
            body: 'GraphQL is soooo coooool',
            published: true,
            post_date: '2018-02-15T12:13:14',
            user: users[0]
        });
        const result = await apiBackend.create(
            manager, post, createOptions, createResult
        );
        expect(result.success).to.be.true;
        expect(result.validation).to.be.an('object');
        expect(result.validation.valid).to.be.true;
        expect(result.results).to.be.undefined;
        expect(result.result).to.be.instanceof(Post);
        expect(result.result.id).to.be.a('number');
        expect(result.result.title).to.equal(post.title);
        expect(result.result.body).to.equal(post.body);
        expect(result.result.published).to.equal(post.published);
        expect(result.result.post_date).to.equal(post.post_date);
    });

    it('returns an unsuccessful result with error details if validation errors occur', async () => {
        const post = new Post({
            title: 'Forgot to add the body...',
            published: false,
            post_date: 'not a date',
            user: users[0]
        });
        const result = await apiBackend.create(
            manager, post, createOptions, createResult
        );
        expect(result.success).to.be.false;
        expect(result.validation).to.be.an('object');
        expect(result.validation.valid).to.be.false;
        expect(result.validation.fieldErrors['body']).to.deep.equal([
            { message: 'body is a required field', code: 'required' }
        ]);
        expect(result.validation.fieldErrors['post_date']).to.deep.equal([
            { message: 'post_date should be a date and time', code: 'not_a_datetime' }
        ]);
        expect(result.results).to.be.undefined;
        expect(result.result).to.be.undefined;
    });

    it('throws error with received data if response is empty', () => {
        const mockResponse: AxiosResponse = {
            data: null,
            status: 200, statusText: '', headers: {}, config: {}
        };
        setup({ responseType: 'mock', mockResponse: mockResponse });

        return apiBackend.create(manager, new Comment(), createOptions, createResult)
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

        return apiBackend.create(manager, new Comment(), createOptions, createResult)
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

        return apiBackend.create(manager, new Comment(), createOptions, createResult)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('GraphQL response did not contain the expected operation results');
                expect(err.response).to.equal(mockResponse);
            });
    });

});