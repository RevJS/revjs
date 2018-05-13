
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
                        results {
                            id,
                            title,
                            body,
                            published,
                            post_date
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data!.Post.results).to.deep.equal([]);
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
                        results {
                            id,
                            title,
                            body,
                            published,
                            post_date
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data!.Post.results).to.have.length(expectedData.posts.length);
            for (let i = 0; i < expectedData.posts.length; i++) {
                expect(result.data!.Post.results[i]).to.deep.equal({
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
        let expectedData: models.ModelWithAllScalarFields;

        beforeEach(async () => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.ModelWithAllScalarFields, { operations: ['read'] });

            expectedData = new models.ModelWithAllScalarFields({
                autoNumberField: 1,
                integerField: 2,
                numberField: 3.456,
                textField: 'A test model with all default field types',
                emailField: 'test@test.com',
                urlField: 'http://www.test.com',
                passwordField: 'password123',
                booleanField: true,
                selectField: 'Y',
                multiSelectField: ['A', 'B'],
                dateField: '2017-12-25',
                timeField: '12:13:14',
                dateTimeField: '2017-12-25T12:13:14'
            });
            await modelManager.create(expectedData);

            schema = apiManager.getGraphQLSchema();
        });

        it('a query returns the expected data', async () => {
            const query = `
                query {
                    ModelWithAllScalarFields {
                        results {
                            autoNumberField
                            integerField
                            numberField
                            textField
                            emailField
                            urlField
                            passwordField
                            booleanField
                            selectField
                            multiSelectField
                            dateField
                            timeField
                            dateTimeField
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data!.ModelWithAllScalarFields.results).to.have.length(1);
            expect(result.data!.ModelWithAllScalarFields.results[0]).to.deep.equal({
                autoNumberField: 1,
                integerField: expectedData.integerField,
                numberField: expectedData.numberField,
                textField: expectedData.textField,
                emailField: expectedData.emailField,
                urlField: expectedData.urlField,
                passwordField: expectedData.passwordField,
                booleanField: expectedData.booleanField,
                selectField: expectedData.selectField,
                multiSelectField: expectedData.multiSelectField,
                dateField: expectedData.dateField,
                timeField: expectedData.timeField,
                dateTimeField: expectedData.dateTimeField
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
            api.fieldMappings.forEach((converter) => {
                if (converter[0] == fields.TextFieldBase) {
                    converter[1].converter = (model, fieldName) => {
                        return 'I am a custom converter!';
                    };
                }
            });

            data = new models.ModelWithAllScalarFields({
                integerField: 2,
                numberField: 3.456,
                textField: 'I should be overridden...',
                emailField: 'test@test.com',
                urlField: 'http://www.test.com',
                passwordField: 'password123',
                booleanField: true,
                selectField: 'Y',
                multiSelectField: ['A', 'B'],
                dateField: '2017-12-25',
                timeField: '12:13:14',
                dateTimeField: '2017-12-25T12:13:14'
            });
            await modelManager.create(data);

            schema = api.getSchema();
        });

        it('a query returns the expected data', async () => {
            const query = `
                query {
                    ModelWithAllScalarFields {
                        results {
                            autoNumberField
                            integerField
                            numberField
                            textField
                            emailField
                            urlField
                            passwordField
                            booleanField
                            selectField
                            multiSelectField
                            dateField
                            timeField
                            dateTimeField
                        }
                    }
                }
            `;
            const result = await graphql(schema, query);
            expect(result.data!.ModelWithAllScalarFields.results).to.have.length(1);
            expect(result.data!.ModelWithAllScalarFields.results[0].textField).to.equal('I am a custom converter!');
        });

    });

});
