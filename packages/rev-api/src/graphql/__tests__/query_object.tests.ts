
import { expect } from 'chai';
import { ModelApiManager } from '../../api/manager';
import * as models from '../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { ModelManager } from 'rev-models';
import { createData } from '../__fixtures__/modeldata';
import { GraphQLApi } from '../api';

describe('GraphQL query type - top-level objects', () => {

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

    it('Returns "records" and "meta" objects at the top level', async () => {
        const query = `
            query {
                Post {
                    results {
                        id,
                        title
                    }
                    meta {
                        limit
                        offset
                        totalCount
                    }
                }
            }
        `;
        const result = await graphql(schema, query);
        expect(result.data.Post).to.deep.equal({
            results: [
                { id: 1, title: 'RevJS v1.0.0 Released!' },
                { id: 2, title: 'JavaScript is Awesome' },
                { id: 3, title: 'Ruby Sucks' }
            ],
            meta: {
                limit: 20,
                offset: 0,
                totalCount: 3
            }
        });
    });

    it('does not return "records" and "meta" objects at lower levels', async () => {
        const query = `
            query {
                Post {
                    results {
                        id,
                        title,
                        comments {
                            id,
                            comment
                        }
                    }
                    meta {
                        limit
                        offset
                        totalCount
                    }
                }
            }
        `;
        const result = await graphql(schema, query);
        expect(result.data.Post).to.deep.equal({
            results: [
                {
                    id: 1, title: 'RevJS v1.0.0 Released!',
                    comments: [
                        { id: 1, comment: 'I totally agree'},
                        { id: 2, comment: 'Sweet!' }
                    ]
                },
                {
                    id: 2, title: 'JavaScript is Awesome',
                    comments: []
                },
                {
                    id: 3, title: 'Ruby Sucks',
                    comments: []
                }
            ],
            meta: {
                limit: 20,
                offset: 0,
                totalCount: 3
            }
        });
    });

});
