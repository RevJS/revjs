
import { expect } from 'chai';
import { ModelApiManager } from '../../../api/manager';
import * as models from '../../__tests__/models.fixture';
import { graphql, GraphQLSchema } from 'graphql';
import { getGraphQLSchema } from '../../schema';
import { ModelManager } from 'rev-models';

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

});
