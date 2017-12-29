
import { expect } from 'chai';
import { ModelApiManager } from '../../api/manager';
import * as models from '../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { GraphQLApi } from '../api';

describe('GraphQL "query" type - model list', () => {

    describe('When no models are registered', () => {
        let manager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;

        before(() => {
            manager = new ModelApiManager(models.getModelManager());
            api = new GraphQLApi(manager);
            schema = api.getSchema();
        });

        it('API should not have any models available for read', () => {
            expect(manager.getModelNamesByOperation('read')).to.have.length(0);
        });

        it('Schema contains a single "no_models" field', async () => {
            const query = `
                query {
                    __schema {
                        queryType {
                            fields {
                                name,
                                type { name }
                            }
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.__schema.queryType.fields).to.have.length(1);
            expect(result.data.__schema.queryType.fields[0].name).to.equal('no_models');
            expect(result.data.__schema.queryType.fields[0].type.name).to.equal('String');
        });

        it('"no_models" field resolves to a fixed message', async () => {
            const query = `
                query {
                    no_models
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.no_models).to.equal('No models have been registered for read access');
        });

    });

    describe('When models are registered', () => {

        let manager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;

        before(() => {
            manager = new ModelApiManager(models.getModelManager());
            manager.register(models.User, { operations: ['read'] });
            manager.register(models.Post, { operations: ['read'] });
            api = new GraphQLApi(manager);

            schema = api.getSchema();
        });

        it('they are available to query, and have the correct return type', async () => {
            const query = `
                query {
                    __schema {
                        queryType {
                            fields {
                                name,
                                type {
                                    kind,
                                    ofType { name }
                                }
                            }
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.__schema.queryType.fields).to.have.length(2);
            expect(result.data.__schema.queryType.fields[0].name).to.equal('User');
            expect(result.data.__schema.queryType.fields[0].type).to.deep.equal({
                kind: 'LIST',
                ofType: { name: 'User' }
            });
            expect(result.data.__schema.queryType.fields[1].name).to.equal('Post');
            expect(result.data.__schema.queryType.fields[1].type).to.deep.equal({
                kind: 'LIST',
                ofType: { name: 'Post' }
            });
        });

    });

    describe('When some models are not readable', () => {

        let manager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;

        before(() => {
            manager = new ModelApiManager(models.getModelManager());
            manager.register(models.Post, { operations: ['create'] });
            manager.register(models.UnrelatedModel, { operations: ['read'] });
            api = new GraphQLApi(manager);

            schema = api.getSchema();
        });

        it('only registers models that are readable', async () => {
            const query = `
                query {
                    __schema {
                        queryType {
                            fields {
                                name
                            }
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.__schema.queryType.fields).to.have.length(1);
            expect(result.data.__schema.queryType.fields[0].name).to.equal('UnrelatedModel');
        });

        it('attempts to read unreadable models fail', async () => {
            const query = `
                query {
                    Post {
                        title
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data).to.be.undefined;
            expect(result.errors).to.have.length(1);
            expect(result.errors[0].message).to.equal('Cannot query field "Post" on type "query".');
        });

    });

    describe('When registering models with unknown field types', () => {

        let manager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;

        before(() => {
            manager = new ModelApiManager(models.getModelManager());
            manager.register(models.ModelWithUnknownField, { operations: ['read'] });
            api = new GraphQLApi(manager);
        });

        it('getGraphQLSchema() throws an error', async () => {
            expect(() => {
                schema = api.getSchema();
            }).to.throw('The field class of ModelWithUnknownField.unknownField does not have a registered mapping');
        });

    });

    describe('When registering models that reference other models that are not in the API', () => {

        let manager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;

        before(() => {
            manager = new ModelApiManager(models.getModelManager());
            manager.register(models.Post, { operations: ['read'] });
            api = new GraphQLApi(manager);
        });

        it('getSchema() throws with a helpful error message', async () => {
            expect(() => {
                schema = api.getSchema();
            }).to.throw(`Model field 'Post.user' is linked to a model 'User', which is not registered with the api`);
        });

    });

});
