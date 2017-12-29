
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
                        id,
                        title
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.Post).to.deep.equal([{
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
                        id,
                        title
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.Post).to.deep.equal([{
                id: 2,
                title: 'JavaScript is Awesome'
            }]);
        });

        it('If the "where" argument is not an object I get an error', async () => {
            const query = `
                query {
                    Post(where: 2) {
                        id,
                        title
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
                        id,
                        title
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.errors[0].message).to.contain(`fred' is not a recognised field`);
        });

    });
});