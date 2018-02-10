
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ModelApiManager } from '../../../api/manager';
import * as models from '../../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { GraphQLApi } from '../../api';
import { ModelManager, IModelOperationResult } from 'rev-models';
import { IUpdateMeta } from 'rev-models/lib/models/types';

describe('GraphQL "mutation" type - Model_update()', () => {

    describe('Method Signature', () => {
        let manager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let signature: any;

        before(async () => {
            manager = new ModelApiManager(models.getModelManager());
            manager.register(models.Post, { operations: ['update'] });
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
                                        name
                                        kind
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

        it('Mutation name is the model name plus _update', () => {
            expect(signature.name).to.equal('Post_update');
        });

        it('takes "model" and "where" arguments', () => {
            expect(signature.args).to.have.length(2);
            expect(signature.args[0].name).to.equal('model');
            expect(signature.args[1].name).to.equal('where');
        });

        it('"model" argument is of the correct type', () => {
            expect(signature.args[0].name).to.equal('model');
            expect(signature.args[0].type.kind).to.equal('NON_NULL');
            expect(signature.args[0].type.ofType.name).to.equal('Post_input');
            expect(signature.args[0].type.ofType.kind).to.equal('INPUT_OBJECT');
        });

        it('"where" argument is of the correct type', () => {
            expect(signature.args[1].name).to.equal('where');
            expect(signature.args[1].type.name).to.equal('JSON');
            expect(signature.args[1].type.kind).to.equal('SCALAR');
        });

    });

    describe('Calling Model_update() - options passed through to modelManager', () => {
        let modelManager: ModelManager;
        let apiManager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let updateSpy: sinon.SinonStub;

        beforeEach(async () => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.Post, { operations: ['read', 'update'] });
            apiManager.register(models.User, { operations: ['read'] });
            apiManager.register(models.Comment, { operations: ['read'] });
            api = new GraphQLApi(apiManager);
            schema = api.getSchema();

            updateSpy = sinon.stub().returns(Promise.resolve({ success: true }));
            modelManager.update = updateSpy;
        });

        it('when a model is specified, modelManager.update() is called with "model" option set', async () => {
            const query = `
                mutation {
                    Post_update(model: {
                        id: 10,
                        title: "Post Partial Update...",
                    })
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors).to.be.undefined;
            expect(updateSpy.callCount).to.equal(1);

            const updateArgs = updateSpy.getCall(0).args;
            expect(updateArgs).to.have.length(2);
            expect(updateArgs[0]).to.be.instanceof(models.Post);
            expect(updateArgs[0]).to.include({
                id: 10,
                title: 'Post Partial Update...'
            });
            expect(updateArgs[1]).to.be.undefined;

        });

        it('when a "where" clause is specified, it is passed to modelManager.update()', async () => {
            const query = `
                mutation {
                    Post_update(
                        model: { title: "Update with Where clause" },
                        where: { id: { _gt: 1 } }
                    )
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors).to.be.undefined;
            expect(updateSpy.callCount).to.equal(1);

            const updateArgs = updateSpy.getCall(0).args;
            expect(updateArgs).to.have.length(2);
            expect(updateArgs[0]).to.be.instanceof(models.Post);
            expect(updateArgs[0]).to.include({
                title: 'Update with Where clause'
            });
            expect(updateArgs[1]).to.deep.equal({
                where: { id: { _gt: 1 } }
            });

        });

    });

    describe('Calling Model_update()', () => {
        let modelManager: ModelManager;
        let apiManager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let existingPost: models.Post;

        beforeEach(async () => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.Post, { operations: ['read', 'update'] });
            apiManager.register(models.User, { operations: ['read'] });
            apiManager.register(models.Comment, { operations: ['read'] });
            api = new GraphQLApi(apiManager);
            schema = api.getSchema();

            existingPost = new models.Post({
                id: 10,
                title: 'Existing Post',
                body: 'This post has already been created',
                published: true,
                post_date: '2017-12-23T09:30:21'
            });
            await modelManager.create(existingPost);
        });

        it('When "model" arg is not specified, an error is returned', async () => {
            const query = `
                mutation {
                    Post_update
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors).to.have.length(1);
            expect(result.errors[0].message).to.contain('argument "model" of type "Post_input!" is required but not provided');
        });

        it('When model has validation errors, an unsuccessful result is returned with the errors', async () => {
            const query = `
                mutation {
                    Post_update(model: {
                        id: 10,
                        title: "Fake News"
                    })
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors).to.be.undefined;
            expect(result.data).to.be.an('object');
            expect(result.data.Post_update).to.be.an('object');

            const opResult: IModelOperationResult<any, IUpdateMeta> = result.data.Post_update;
            expect(opResult.success).to.be.false;
            expect(opResult.validation).to.be.an('object');
            expect(opResult.validation.modelErrors).to.have.length(1);
            expect(opResult.validation.modelErrors[0].message).to.equal('Fake News is not allowed!');
        });

        // it('When model is valid, a successful result is returned with the created model', async () => {
        //     const query = `
        //         mutation {
        //             Post_create(model: {
        //                 title: "Awesome Post",
        //                 body: "This post is valid and therefore awesome",
        //                 published: true,
        //                 post_date: "2018-01-01T12:01:12"
        //             })
        //         }
        //     `;
        //     const result = await graphql(schema, query);
        //     expect(result.errors).to.be.undefined;
        //     expect(result.data).to.be.an('object');
        //     expect(result.data.Post_create).to.be.an('object');

        //     const opResult: IModelOperationResult<any, ICreateMeta> = result.data.Post_create;
        //     expect(opResult.success).to.be.true;
        //     expect(opResult.result).to.deep.include({
        //         id: 1,
        //         title: 'Awesome Post',
        //         body: 'This post is valid and therefore awesome',
        //         published: true,
        //         post_date: '2018-01-01T12:01:12'
        //     });
        // });

        // // TODO: We should recommend some best practise for hiding error details in production
        // it('if modelManager.create() throws some other error, a graphql error is raised', async () => {
        //     const expectedError = new Error('AAAAAAAaaaAaaaarrrrgh!!!!');
        //     modelManager.create = () => Promise.reject(expectedError);

        //     const query = `
        //         mutation {
        //             Post_create(model: {})
        //         }
        //     `;
        //     const result = await graphql(schema, query);
        //     expect(result.errors).to.have.length(1);
        //     expect(result.errors[0].message).to.equal(expectedError.message);
        // });

    });

});
