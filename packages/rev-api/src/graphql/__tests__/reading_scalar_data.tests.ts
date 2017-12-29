
import { expect } from 'chai';
import { ModelApiManager } from '../../api/manager';
import * as models from '../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { ModelManager, fields } from 'rev-models';
import { createData, IModelTestData } from '../__fixtures__/modeldata';
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
            apiManager.register(models.User, { operations: ['read'] });
            apiManager.register(models.Comment, { operations: ['read'] });
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
        let expectedData: IModelTestData;

        beforeEach(async () => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.Post, { operations: ['read'] });
            apiManager.register(models.User, { operations: ['read'] });
            apiManager.register(models.Comment, { operations: ['read'] });
            api = new GraphQLApi(apiManager);

            expectedData = await createData(modelManager);

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
            expect(result.data.Post).to.have.length(expectedData.posts.length);
            for (let i = 0; i < expectedData.posts.length; i++) {
                expect(result.data.Post[i]).to.deep.equal({
                    id: expectedData.posts[i].id,
                    title: expectedData.posts[i].title,
                    body: expectedData.posts[i].body,
                    published: expectedData.posts[i].published,
                    post_date: expectedData.posts[i].post_date,
                });
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
            await modelManager.create(data);

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

    describe('Can override Model -> GraphQL field conversion', () => {

        let apiManager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let modelManager: ModelManager;
        let data: models.ModelWithAllScalarFields;

        beforeEach(async () => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.ModelWithAllScalarFields, { operations: ['read'] });
            api = new GraphQLApi(apiManager);
            api.fieldConverters.forEach((converter) => {
                if (converter[0] == fields.TextField) {
                    converter[1].converter = (model, fieldName) => {
                        return 'I am a custom converter!';
                    };
                }
            });

            data = new models.ModelWithAllScalarFields();
            await modelManager.create(data);

            schema = api.getSchema();
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
            expect(result.data.ModelWithAllScalarFields[0].textField).to.equal('I am a custom converter!');
        });

    });

});
