
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ModelApiManager } from '../../../api/manager';
import * as models from '../../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { GraphQLApi } from '../../api';
import { ModelManager } from 'rev-models';

describe('GraphQL "mutation" type - Model_create()', () => {

    describe('Method Signature', () => {
        let manager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let signature: any;

        before(async () => {
            manager = new ModelApiManager(models.getModelManager());
            manager.register(models.Post, { operations: ['create'] });
            api = new GraphQLApi(manager);
            schema = api.getSchema();

            const query = `
                query {
                    __schema {
                        mutationType {
                            fields {
                                name
                                args {
                                    name
                                    type {
                                        kind,
                                        ofType {
                                            name
                                            kind
                                        }
                                    }
                                }
                                type {
                                    name
                                    kind
                                }
                            }
                        }
                    }
                }
            `;

            const result = await graphql(schema, query);
            signature = result.data.__schema.mutationType.fields[0];
        });

        it('Mutation name is the model name plus _create', () => {
            expect(signature.name).to.equal('Post_create');
        });

        it('takes a single, non-nullable "model" argument', () => {
            expect(signature.args).to.have.length(1);
            expect(signature.args[0].name).to.equal('model');
            expect(signature.args[0].type.kind).to.equal('NON_NULL');
            expect(signature.args[0].type.ofType.name).to.equal('Post_input');
            expect(signature.args[0].type.ofType.kind).to.equal('INPUT_OBJECT');
        });

        it('return type is JSON (will be a ModelOperationResult)', () => {
            expect(signature.type.name).to.equal('JSON');
            expect(signature.type.kind).to.equal('SCALAR');
        });

    });

    describe('calling Model_create()', () => {
        let modelManager: ModelManager;
        let apiManager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let createSpy: sinon.SinonSpy;
        const expectedResult = { success: true };

        beforeEach(() => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.Post, { operations: ['create'] });
            api = new GraphQLApi(apiManager);
            schema = api.getSchema();
            createSpy = sinon.stub().returns(Promise.resolve(expectedResult));
            modelManager.create = createSpy;
        });

        it('When "model" arg is not specified, an error is returned', async () => {
            const query = `
                mutation {
                    Post_create
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors).to.have.length(1);
            expect(result.errors[0].message).to.contain('argument "model" of type "Post_input!" is required but not provide');
        });

        it('When model arg is empty, an empty model is hydrated and passed to ModelManager.create()', async () => {
            const query = `
                mutation {
                    Post_create( model: {} )
                }
            `;
            await graphql(schema, query);
            expect(createSpy.callCount).to.equal(1);
            expect(createSpy.getCall(0).args).to.deep.equal([
                new models.Post({})
            ]);
        });

        it('When model arg has values, they are hydrated and passed to ModelManager.create()', async () => {
            const query = `
                mutation {
                    Post_create(model: {
                        title: "GraphQL Post",
                        body: "rev-api is really cool",
                        published: true,
                        post_date: "2018-02-06T16:01:27"
                    })
                }
            `;
            await graphql(schema, query);
            expect(createSpy.callCount).to.equal(1);
            expect(createSpy.getCall(0).args).to.deep.equal([
                new models.Post({
                    title: 'GraphQL Post',
                    body: 'rev-api is really cool',
                    published: true,
                    post_date: '2018-02-06T16:01:27'
                })
            ]);
        });

        it('Model_create() returns the result of modelManager.create()', async () => {
            const query = `
                mutation {
                    Post_create( model: {} )
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors).to.be.undefined;
            expect(result.data).to.deep.equal({
                Post_create: expectedResult
            });
        });

    });
});
