
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ModelApiManager } from '../../../api/manager';
import * as models from '../../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { GraphQLApi } from '../../api';
import { ModelManager } from 'rev-models';
import { posts, users, createData } from '../../__fixtures__/modeldata';

describe('GraphQL "mutation" type - relational input data', () => {

    let modelManager: ModelManager;
    let apiManager: ModelApiManager;
    let api: GraphQLApi;
    let schema: GraphQLSchema;
    let createSpy: sinon.SinonSpy;
    const mockResult = { success: true };

    beforeEach(async () => {
        modelManager = models.getModelManager();
        await createData(modelManager);

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
        await graphql(schema, query);
        expect(createSpy.callCount).to.equal(1);

        expect(createSpy.getCall(0).args[0]).to.be.instanceof(models.Comment);
        expect(createSpy.getCall(0).args[0]).to.deep.include({
            comment: 'Fantastic news!',
        });
        expect(createSpy.getCall(0).args[0].post).to.be.instanceof(models.Post);
        expect(createSpy.getCall(0).args[0].post).to.deep.include({
            id: 1,
            title: posts[0].title,
            body: posts[0].body,
            post_date: posts[0].post_date,
            published: posts[0].published,
        });
        expect(createSpy.getCall(0).args[0].user).to.be.instanceof(models.User);
        expect(createSpy.getCall(0).args[0].user).to.deep.include({
            id: 2,
            name: users[1].name,
            date_registered: users[1].date_registered
        });
    });

});
