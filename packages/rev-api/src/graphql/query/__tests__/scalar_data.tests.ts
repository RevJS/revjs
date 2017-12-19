
import { expect } from 'chai';
import { ModelApiManager } from '../../../api/manager';
import * as models from '../../__tests__/models.fixture';
import { graphql, GraphQLSchema } from 'graphql';
import { getGraphQLSchema } from '../../schema';
import { ModelManager } from 'rev-models';
import { createPosts } from '../../__tests__/modeldata.fixture';
import { expectToHaveProperties } from '../../../__test_utils__/utils';

describe('GraphQL "query" type - scalar model data', () => {

    describe('When model has no data', () => {

        let api: ModelApiManager;
        let schema: GraphQLSchema;
        let manager: ModelManager;

        before(() => {
            manager = models.getModelManager();
            api = new ModelApiManager(manager);
            api.register(models.Post, { operations: ['read'] });

            schema = getGraphQLSchema(api);
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

        let api: ModelApiManager;
        let schema: GraphQLSchema;
        let manager: ModelManager;
        let expectedPosts: models.Post[];

        beforeEach(async () => {
            manager = models.getModelManager();
            api = new ModelApiManager(manager);
            api.register(models.Post, { operations: ['read'] });
            expectedPosts = await createPosts(manager);

            schema = getGraphQLSchema(api);
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
