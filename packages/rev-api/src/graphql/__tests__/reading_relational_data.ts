
import { expect } from 'chai';
import { ModelApiManager } from '../../api/manager';
import * as models from '../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { ModelManager } from 'rev-models';
import { createData, IModelTestData } from '../__fixtures__/modeldata';
import { GraphQLApi } from '../api';

describe('Querying relational data', () => {
    let apiManager: ModelApiManager;
    let api: GraphQLApi;
    let schema: GraphQLSchema;
    let modelManager: ModelManager;
    let expectedData: IModelTestData;

    async function setup() {
        modelManager = models.getModelManager();
        apiManager = new ModelApiManager(modelManager);
        apiManager.register(models.Post, { operations: ['read'] });
        apiManager.register(models.User, { operations: ['read'] });
        api = new GraphQLApi(apiManager);

        expectedData = await createData(modelManager);

        schema = api.getSchema();
    }

    beforeEach(setup);

    it('Can read data from RelatedModel fields (1-level deep)', async () => {
        const query = `
            query {
                Post {
                    id,
                    title,
                    post_date,
                    user {
                        name
                    }
                }
            }
        `;
        const result = await graphql(schema, query);
        expect(result.data.Post).to.deep.equal([
            {
                id: 1,
                title: 'RevJS v1.0.0 Released!',
                post_date: '2018-01-31T12:11:10',
                user: {
                    name: 'Billy Bob'
                }
            },
            {
                id: 2,
                title: 'JavaScript is Awesome',
                post_date: '2017-04-15T13:14:15',
                user: {
                    name: 'Billy Bob'
                }
            },
            {
                id: 3,
                title: 'Ruby Sucks',
                post_date: '2017-07-02T01:02:03',
                user: {
                    name: 'Mike Portnoy'
                }
            }
        ]);
    });

});
