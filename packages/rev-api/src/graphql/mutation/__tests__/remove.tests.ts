
import { expect } from 'chai';
import { ModelApiManager } from '../../../api/manager';
import * as models from '../../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { GraphQLApi } from '../../api';
import { ModelManager, IModelOperationResult } from 'rev-models';
import { IRemoveMeta } from 'rev-models/lib/models/types';

describe('GraphQL "mutation" type - Model_remove()', () => {

    describe('Method Signature', () => {
        let manager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let signature: any;

        before(async () => {
            manager = new ModelApiManager(models.getModelManager());
            manager.register(models.Post, { operations: ['remove'] });
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

        it('Mutation name is the model name plus _remove', () => {
            expect(signature.name).to.equal('Post_remove');
        });

        it('takes a single "where" arguments', () => {
            expect(signature.args).to.have.length(1);
            expect(signature.args[0].name).to.equal('where');
        });

        it('"where" argument is of the correct type', () => {
            expect(signature.args[0].name).to.equal('where');
            expect(signature.args[0].type.kind).to.equal('NON_NULL');
            expect(signature.args[0].type.ofType.name).to.equal('JSON');
            expect(signature.args[0].type.ofType.kind).to.equal('SCALAR');
        });

    });

    describe('Calling Model_remove()', () => {
        let modelManager: ModelManager;
        let apiManager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let existingPost: models.Post;
        let existingPost2: models.Post;

        beforeEach(async () => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.Post, { operations: ['remove'] });
            api = new GraphQLApi(apiManager);
            schema = api.getSchema();

            existingPost = new models.Post({
                id: 10,
                title: 'Existing Post',
                body: 'This post has already been created',
                published: true,
                post_date: '2017-12-23T09:30:21'
            });
            existingPost2 = new models.Post({
                id: 11,
                title: 'Another Post',
                body: 'This is another post',
                published: true,
                post_date: '2018-01-05T12:23:34'
            });
            await modelManager.create(existingPost);
            await modelManager.create(existingPost2);
        });

        it('When "where" arg is not specified, an error is returned', async () => {
            const query = `
                mutation {
                    Post_remove
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors).to.have.length(1);
            expect(result.errors[0].message).to.contain('argument "where" of type "JSON!" is required but not provided');
        });

        it('When the "were" clause is valid, the matching record is removed', async () => {
            const query = `
                mutation {
                    Post_remove(where: {
                        id: 10
                    })
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors).to.be.undefined;
            expect(result.data).to.be.an('object');
            expect(result.data.Post_remove).to.be.an('object');

            const opResult: IModelOperationResult<any, IRemoveMeta> = result.data.Post_remove;
            expect(opResult.success).to.be.true;
            expect(opResult.result).to.be.undefined;
            expect(opResult.results).to.be.undefined;
            expect(opResult.meta).to.deep.equal({
                totalCount: 1
            });
        });

        it('When the "were" clause is valid and matches multiple records, they are removed', async () => {
            const query = `
                mutation {
                    Post_remove(where: {
                        id: { _gt: 1 }
                    })
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors).to.be.undefined;
            expect(result.data).to.be.an('object');
            expect(result.data.Post_remove).to.be.an('object');

            const opResult: IModelOperationResult<any, IRemoveMeta> = result.data.Post_remove;
            expect(opResult.success).to.be.true;
            expect(opResult.result).to.be.undefined;
            expect(opResult.results).to.be.undefined;
            expect(opResult.meta).to.deep.equal({
                totalCount: 2
            });
        });

        // TODO: We should recommend some best practise for hiding error details in production
        it('if modelManager.remove() throws some other error, a graphql error is raised', async () => {
            const expectedError = new Error('AAAAAAAaaaAaaaarrrrgh!!!!');
            modelManager.remove = () => Promise.reject(expectedError);

            const query = `
                mutation {
                    Post_remove(where: { jimmy: "flibble" })
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors).to.have.length(1);
            expect(result.errors[0].message).to.equal(expectedError.message);
        });

    });

});
