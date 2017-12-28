
import { expect } from 'chai';
import { ModelApiManager } from '../../api/manager';
import * as models from './models.fixture';
import { graphql, GraphQLSchema } from 'graphql';
import { ModelManager } from 'rev-models';
import { createPosts } from './modeldata.fixture';
import { expectToHaveProperties } from '../../__test_utils__/utils';
import { GraphQLApi } from '../api';

describe('GraphQL "query" type - scalar model data', () => {

    describe('When model has no data', () => {

        let apiManager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let modelManager: ModelManager;

        before(() => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.Post, { operations: ['read'] });
            api = new GraphQLApi(apiManager);

            schema = api.getSchema();
        });

        it('a query returns an empty array', async () => {
            const query = `
                query {
                    Post {
                        id,
                        title,
                        body,
                        published,
                        post_date
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.Post).to.deep.equal([]);
        });

    });

    describe('When model has data', () => {

        let apiManager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let modelManager: ModelManager;
        let expectedPosts: models.Post[];

        beforeEach(async () => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.Post, { operations: ['read'] });
            api = new GraphQLApi(apiManager);
            expectedPosts = await createPosts(modelManager);

            schema = api.getSchema();
        });

        it('a query returns the expected data', async () => {
            const query = `
                query {
                    Post {
                        id,
                        title,
                        body,
                        published,
                        post_date
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.Post).to.have.length(expectedPosts.length);
            for (let i = 0; i < expectedPosts.length; i++) {
                expectToHaveProperties(result.data.Post[i], expectedPosts[i]);
            }
        });

    });

});
