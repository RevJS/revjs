
import { expect } from 'chai';
import { ModelApiManager } from '../../../api/manager';
import * as models from '../../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { GraphQLApi } from '../../api';
import { ModelManager, IModelOperationResult } from 'rev-models';
import { ICreateMeta } from 'rev-models/lib/models/types';

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
            signature = result.data!.__schema.mutationType.fields[0];
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

        beforeEach(() => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.Post, { operations: ['create'] });
            api = new GraphQLApi(apiManager);
            schema = api.getSchema();
        });

        it('When "model" arg is not specified, an error is returned', async () => {
            const query = `
                mutation {
                    Post_create
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors).to.have.length(1);
            expect(result.errors![0].message).to.contain('argument "model" of type "Post_input!" is required but not provide');
        });

        it('When model has validation errors, an unsuccessful result is returned with the errors', async () => {
            const query = `
                mutation {
                    Post_create(model: {
                        title: "Incomplete Post...",
                    })
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors).to.be.undefined;
            expect(result.data).to.be.an('object');
            expect(result.data!.Post_create).to.be.an('object');

            const opResult: IModelOperationResult<any, ICreateMeta> = result.data!.Post_create;
            expect(opResult.success).to.be.false;
            expect(opResult.validation).to.be.an('object');
            opResult.validation = opResult.validation!;
            expect(opResult.validation.fieldErrors).to.have.property('body');
            expect(opResult.validation.fieldErrors).to.have.property('published');
            expect(opResult.validation.fieldErrors).to.have.property('post_date');
        });

        it('When model is valid, a successful result is returned with the created model', async () => {
            const query = `
                mutation {
                    Post_create(model: {
                        title: "Awesome Post",
                        body: "This post is valid and therefore awesome",
                        published: true,
                        post_date: "2018-01-01T12:01:12"
                    })
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors).to.be.undefined;
            expect(result.data).to.be.an('object');
            expect(result.data!.Post_create).to.be.an('object');

            const opResult: IModelOperationResult<any, ICreateMeta> = result.data!.Post_create;
            expect(opResult.success).to.be.true;
            expect(opResult.result).to.deep.include({
                id: 1,
                title: 'Awesome Post',
                body: 'This post is valid and therefore awesome',
                published: true,
                post_date: '2018-01-01T12:01:12'
            });
        });

        // TODO: We should recommend some best practise for hiding error details in production
        it('if modelManager.create() throws some other error, a graphql error is raised', async () => {
            const expectedError = new Error('AAAAAAAaaaAaaaarrrrgh!!!!');
            modelManager.create = () => Promise.reject(expectedError);

            const query = `
                mutation {
                    Post_create(model: {})
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors).to.have.length(1);
            expect(result.errors![0].message).to.equal(expectedError.message);
        });

    });
});
