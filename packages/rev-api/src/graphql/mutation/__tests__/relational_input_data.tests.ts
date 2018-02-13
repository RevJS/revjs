
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ModelApiManager } from '../../../api/manager';
import * as models from '../../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { GraphQLApi } from '../../api';
import { ModelManager } from 'rev-models';
import { posts, users } from '../../__fixtures__/modeldata';

describe.only('GraphQL "mutation" type - relational input data', () => {

    let modelManager: ModelManager;
    let apiManager: ModelApiManager;
    let api: GraphQLApi;
    let schema: GraphQLSchema;
    let createSpy: sinon.SinonSpy;
    const mockResult = { success: true };

    beforeEach(() => {
        modelManager = models.getModelManager();
        apiManager = new ModelApiManager(modelManager);
        apiManager.register(models.Comment, { operations: ['create'] });
        api = new GraphQLApi(apiManager);
        schema = api.getSchema();
        createSpy = sinon.stub().returns(Promise.resolve(mockResult));
        modelManager.create = createSpy;
    });

    it('When primary key values for RelatedModelFields are passed, they are hydrated with related model instances', async () => {
        const query = `
            mutation {
                Comment_create(model: {
                    post: 1,
                    comment: "Fantastic news!",
                    user: 2
                })
            }
        `;
        let result = await graphql(schema, query);
        console.log(result.errors);
        expect(createSpy.callCount).to.equal(1);
        expect(createSpy.getCall(0).args).to.deep.equal([
            new models.Comment({
                post: posts[0],
                comment: 'Fantastic news!',
                user: users[1]
            })
        ]);
    });

});
