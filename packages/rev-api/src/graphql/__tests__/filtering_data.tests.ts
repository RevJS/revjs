
import { expect } from 'chai';
import { ModelApiManager } from '../../api/manager';
import * as models from '../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { ModelManager } from 'rev-models';
import { createData } from '../__fixtures__/modeldata';
import { GraphQLApi } from '../api';

describe('GraphQL query type - filtering model data', () => {

    describe('When using the top-level "where" argument', () => {

        let apiManager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let modelManager: ModelManager;

        beforeEach(async () => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.Post, { operations: ['read'] });
            apiManager.register(models.User, { operations: ['read'] });
            apiManager.register(models.Comment, { operations: ['read'] });
            api = new GraphQLApi(apiManager);

            await createData(modelManager);

            schema = api.getSchema();
        });

        it('I can get Posts by their id', async () => {
            const query = `
                query {
                    Post(where: {id : 2}) {
                        results {
                            id,
                            title
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.Post.results).to.deep.equal([{
                id: 2,
                title: 'JavaScript is Awesome'
            }]);
        });

        it('I can use fancy operators', async () => {
            const query = `
                query {
                    Post(where: {
                            _and: [
                                { id: { _gt: 1 }},
                                { id: { _lt: 3 }}
                            ]}) {
                        results {
                            id,
                            title
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.Post.results).to.deep.equal([{
                id: 2,
                title: 'JavaScript is Awesome'
            }]);
        });

        it('If the "where" argument is not an object I get an error', async () => {
            const query = `
                query {
                    Post(where: 2) {
                        results {
                            id,
                            title
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors[0].message).to.contain('The "where" argument must be an object');
        });

        it('If the "where" argument specifies an invalid field I get an error', async () => {
            const query = `
                query {
                    Post(where: { fred: "bloggs" }) {
                        results {
                            id,
                            title
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors[0].message).to.contain(`fred' is not a recognised field`);
        });

    });

    describe('About pagination and sorting', () => {

        let apiManager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let modelManager: ModelManager;

        beforeEach(async () => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.Post, { operations: ['read'] });
            apiManager.register(models.User, { operations: ['read'] });
            apiManager.register(models.Comment, { operations: ['read'] });
            api = new GraphQLApi(apiManager);

            await createData(modelManager);

            schema = api.getSchema();
        });

        it('I can use the "limit" argument to restrict / expand the number of results', async () => {
            const query = `
                query {
                    Post(limit: 2) {
                        results {
                            id,
                            title
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.Post.results).to.deep.equal([
                {
                    id: 1,
                    title: 'RevJS v1.0.0 Released!'
                },
                {
                    id: 2,
                    title: 'JavaScript is Awesome'
                }
            ]);
        });

        it('I can use the "offset" argument to start returning results from half way through the list', async () => {
            const query = `
                query {
                    Post(offset: 1) {
                        results {
                            id,
                            title
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.Post.results).to.deep.equal([
                {
                    id: 2,
                    title: 'JavaScript is Awesome'
                },
                {
                    id: 3,
                    title: 'Ruby Sucks'
                }
            ]);
        });

        it('I can use the "limit" and "offset" args together to do magical things (pagination)', async () => {
            const query = `
                query {
                    Post(offset: 1, limit: 1) {
                        results {
                            id,
                            title
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.Post.results).to.deep.equal([
                {
                    id: 2,
                    title: 'JavaScript is Awesome'
                }
            ]);
        });

        it('I can sort the results using the "order_by" argument', async () => {
            // GraphQL automagically converts "title" to ["title"]. Cool :)
            const query = `
                query {
                    Post(order_by: "title") {
                        results {
                            id,
                            title
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.Post.results).to.deep.equal([
                { id: 2, title: 'JavaScript is Awesome'},
                { id: 1, title: 'RevJS v1.0.0 Released!'},
                { id: 3, title: 'Ruby Sucks'},
            ]);
        });

        it('I can sort the results in reverse order using the "order_by" argument and "desc" keyword', async () => {
            const query = `
                query {
                    Post(order_by: "id desc") {
                        results {
                            id,
                            title
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.Post.results).to.deep.equal([
                { id: 3, title: 'Ruby Sucks'},
                { id: 2, title: 'JavaScript is Awesome'},
                { id: 1, title: 'RevJS v1.0.0 Released!'},
            ]);
        });

        it('I can sort the results by multiple fields', async () => {
            const query = `
                query {
                    Post(order_by: ["post_date", "title"]) {
                        results {
                            id,
                            title
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.Post.results).to.deep.equal([
                { id: 2, title: 'JavaScript is Awesome'},
                { id: 3, title: 'Ruby Sucks'},
                { id: 1, title: 'RevJS v1.0.0 Released!'},
            ]);
        });

        it('I can use sorting and pagination fields together', async () => {
            const query = `
                query {
                    Post(order_by: "post_date desc", limit: 1) {
                        results {
                            id,
                            title
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.Post.results).to.deep.equal([
                { id: 1, title: 'RevJS v1.0.0 Released!'}
            ]);
        });
    });

});