
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

    it('Can read data from RelatedModel fields', async () => {
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
        console.log(result);
        expect(false).to.equal('Make me green!');
        // expect(result.data.Post).to.have.length(expectedData.posts.length);
        // for (let i = 0; i < expectedData.posts.length; i++) {
        //     expect(result.data.Post[i]).to.deep.equal({
        //         id: expectedData.posts[i].id,
        //         title: expectedData.posts[i].title,
        //         body: expectedData.posts[i].body
        //     });
        // }
    });

});
