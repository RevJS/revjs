
import { expect } from 'chai';
import { ModelApiManager } from '../../api/manager';
import * as models from '../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { ModelManager } from 'rev-models';
import { createData, IModelTestData } from '../__fixtures__/modeldata';
import { GraphQLApi } from '../api';

describe('Querying relational data', () => {
    let apiManager: ModelApiManager;
    let api: GraphQLApi;
    let schema: GraphQLSchema;
    let modelManager: ModelManager;
    let expectedData: IModelTestData;

    async function setup() {
        modelManager = models.getModelManager();
        apiManager = new ModelApiManager(modelManager);
        apiManager.register(models.Post, { operations: ['read'] });
        apiManager.register(models.User, { operations: ['read'] });
        apiManager.register(models.Comment, { operations: ['read'] });
        api = new GraphQLApi(apiManager);

        expectedData = await createData(modelManager);

        schema = api.getSchema();
    }

    beforeEach(setup);

    it('Can read data from RelatedModel fields (1-level deep)', async () => {
        const query = `
            query {
                Post {
                    id,
                    title,
                    post_date,
                    user {
                        name
                    }
                }
            }
        `;
        const result = await graphql(schema, query);
        expect(result.data.Post).to.deep.equal([
            {
                id: 1,
                title: 'RevJS v1.0.0 Released!',
                post_date: '2018-01-31T12:11:10',
                user: {
                    name: 'Billy Bob'
                }
            },
            {
                id: 2,
                title: 'JavaScript is Awesome',
                post_date: '2017-04-15T13:14:15',
                user: {
                    name: 'Billy Bob'
                }
            },
            {
                id: 3,
                title: 'Ruby Sucks',
                post_date: '2017-07-02T01:02:03',
                user: {
                    name: 'Mike Portnoy'
                }
            }
        ]);
    });

    it('Can read data from RelatedModelList fields (1-level deep)', async () => {
        const query = `
            query {
                User {
                    id,
                    name,
                    date_registered,
                    posts {
                        post_date
                        title
                    }
                }
            }
        `;
        const result = await graphql(schema, query);
        expect(result.data.User).to.deep.equal([
            {
                id: 1,
                name: 'Billy Bob',
                date_registered: '2012-03-20',
                posts: [
                    { post_date: '2018-01-31T12:11:10', title: 'RevJS v1.0.0 Released!' },
                    { post_date: '2017-04-15T13:14:15', title: 'JavaScript is Awesome' }
                ]
            },
            {
                id: 2,
                name: 'Mike Portnoy',
                date_registered: '2017-10-02',
                posts: [
                    { post_date: '2017-07-02T01:02:03', title: 'Ruby Sucks' }
                ]
            }
        ]);
    });

    it.only('Can read a mix of data from many levels deep', async () => {
        const query = `
            query {
                User {
                    id,
                    name
                    posts {
                        id
                        title
                        comments {
                            id
                            comment
                            user {
                                name
                            }
                        }
                    }

                }
            }
        `;
        const result = await graphql(schema, query);
        console.log(result.data.User[0]);
        console.log(result.data.User[1]);
        expect(result.data.User).to.deep.equal([
            {
                id: 1,
                name: 'Billy Bob',
                posts: [
                    { id: 1, title: 'RevJS v1.0.0 Released!', comments: [
                        // stuff here
                    ]},
                    { id: 2, title: 'JavaScript is Awesome', comments: null }
                ]
            },
            {
                id: 2,
                name: 'Mike Portnoy',
                posts: [
                    { id: 3, title: 'Ruby Sucks', comments: null }
                ]
            }
        ]);
    });

});
