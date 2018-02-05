
import { expect } from 'chai';
import { ModelApiManager } from '../../../api/manager';
import * as models from '../../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { GraphQLApi } from '../../api';

describe('GraphQL "mutation" type - function list', () => {

    describe('When no models are registered', () => {
        let manager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;

        before(() => {
            manager = new ModelApiManager(models.getModelManager());
            api = new GraphQLApi(manager);
            schema = api.getSchema();
        });

        it('Schema does not register a mutationType', async () => {
            const query = `
                query {
                    __schema {
                        mutationType {
                            fields {
                                name
                            }
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.__schema.mutationType).to.be.null;
        });

    });

    describe('When only read operations are registered', () => {
        let manager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;

        before(() => {
            manager = new ModelApiManager(models.getModelManager());
            manager.register(models.Post, { operations: ['read'] });
            manager.register(models.User, { operations: ['read'] });
            manager.register(models.Comment, { operations: ['read'] });
            api = new GraphQLApi(manager);
            schema = api.getSchema();
        });

        it('Schema does not register a mutationType', async () => {
            const query = `
                query {
                    __schema {
                        mutationType {
                            fields {
                                name
                            }
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.__schema.mutationType).to.be.null;
        });

    });

    describe('When other operations are registered', () => {
        let manager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;

        before(() => {
            manager = new ModelApiManager(models.getModelManager());
            manager.register(models.Post, { operations: ['create', 'read', 'update', 'remove'] });
            manager.register(models.User, { operations: ['read'] });
            manager.register(models.Comment, { operations: ['create', 'read'] });
            api = new GraphQLApi(manager);
            schema = api.getSchema();
        });

        it('All non-read operations are registered', async () => {
            const query = `
                query {
                    __schema {
                        mutationType {
                            fields {
                                name
                            }
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.__schema.mutationType.fields).to.deep.equal([
                { name: 'Post_create' },
                { name: 'Post_update' },
                { name: 'Post_remove' },
                { name: 'Comment_create' }
            ]);
        });

    });

    describe('When model methods are registered', () => {
        let manager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;

        before(() => {
            manager = new ModelApiManager(models.getModelManager());
            manager.register(models.User, { methods: { userMethod1: {} } });
            manager.register(models.Post, { methods: { postMethod1: {} } });
            api = new GraphQLApi(manager);
            schema = api.getSchema();
        });

        it('Model methods are available in the schema', async () => {
            const query = `
                query {
                    __schema {
                        mutationType {
                            fields {
                                name
                            }
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.__schema.mutationType.fields).to.deep.equal([
                { name: 'User_userMethod1' },
                { name: 'Post_postMethod1' },
            ]);
        });

    });

    describe('When model operations and methods are registered', () => {
        let manager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;

        before(() => {
            manager = new ModelApiManager(models.getModelManager());
            manager.register(models.User, {
                operations: ['create', 'update'],
                methods: { userMethod1: {} }
            });
            manager.register(models.Post, {
                operations: ['remove'],
                methods: { postMethod1: {} }
            });
            api = new GraphQLApi(manager);
            schema = api.getSchema();
        });

        it('Model methods are available in the schema', async () => {
            const query = `
                query {
                    __schema {
                        mutationType {
                            fields {
                                name
                            }
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.__schema.mutationType.fields).to.deep.equal([
                { name: 'User_create' },
                { name: 'User_update' },
                { name: 'User_userMethod1' },
                { name: 'Post_remove' },
                { name: 'Post_postMethod1' },
            ]);
        });

    });
});
