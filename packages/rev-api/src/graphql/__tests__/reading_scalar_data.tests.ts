
import { expect } from 'chai';
import { ModelApiManager } from '../../api/manager';
import * as models from './models.fixture';
import { graphql, GraphQLSchema } from 'graphql';
import { ModelManager } from 'rev-models';
import { createPosts } from './modeldata.fixture';
import { expectToHaveProperties } from '../../__test_utils__/utils';
import { GraphQLApi } from '../api';

describe('GraphQL query type - scalar model data', () => {

    describe('When model has no data', () => {

        let apiManager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let modelManager: ModelManager;

        before(() => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.Post, { operations: ['read'] });
            api = new GraphQLApi(apiManager);

            schema = api.getSchema();
        });

        it('a query returns an empty array', async () => {
            const query = `
                query {
                    Post {
                        id,
                        title,
                        body,
                        published,
                        post_date
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.Post).to.deep.equal([]);
        });

    });

    describe('When model has data', () => {

        let apiManager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let modelManager: ModelManager;
        let expectedPosts: models.Post[];

        beforeEach(async () => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.Post, { operations: ['read'] });
            api = new GraphQLApi(apiManager);
            expectedPosts = await createPosts(modelManager);

            schema = api.getSchema();
        });

        it('a query returns the expected data', async () => {
            const query = `
                query {
                    Post {
                        id,
                        title,
                        body,
                        published,
                        post_date
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.Post).to.have.length(expectedPosts.length);
            for (let i = 0; i < expectedPosts.length; i++) {
                expectToHaveProperties(result.data.Post[i], expectedPosts[i]);
            }
        });

    });

    describe('Can read all default supported scalar field types', () => {

        let apiManager: ModelApiManager;
        let schema: GraphQLSchema;
        let modelManager: ModelManager;
        let data: models.ModelWithAllScalarFields;

        beforeEach(async () => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.ModelWithAllScalarFields, { operations: ['read'] });

            data = new models.ModelWithAllScalarFields();
            try {
                await modelManager.create(data);
            }
            catch (e) {
                console.log(e.result.validation.fieldErrors);
            }

            schema = apiManager.getGraphQLSchema();
        });

        it('a query returns the expected data', async () => {
            const query = `
                query {
                    ModelWithAllScalarFields {
                        autoNumberField
                        integerField
                        numberField
                        textField
                        booleanField
                        selectionField
                        dateField
                        timeField
                        dateTimeField
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data.ModelWithAllScalarFields).to.have.length(1);
            expect(result.data.ModelWithAllScalarFields[0]).to.deep.equal({
                autoNumberField: 1,
                integerField: 2,
                numberField: 3.456,
                textField: 'A test model with all default field types',
                booleanField: true,
                selectionField: 'Y',
                dateField: '2017-12-25',
                timeField: '12:13:14',
                dateTimeField: '2017-12-25T12:13:14'
            });
        });

    });

});
