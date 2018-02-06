
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ModelApiManager } from '../../../api/manager';
import * as models from '../../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { GraphQLApi } from '../../api';
import { ModelManager } from 'rev-models';

describe('GraphQL "mutation" type - scalar input data', () => {

    describe('Can pass model data for all scalar field types', () => {
        let modelManager: ModelManager;
        let apiManager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let createSpy: sinon.SinonSpy;
        const mockResult = { success: true };

        beforeEach(() => {
            modelManager = models.getModelManager();
            apiManager = new ModelApiManager(modelManager);
            apiManager.register(models.ModelWithAllScalarFields, { operations: ['create'] });
            api = new GraphQLApi(apiManager);
            schema = api.getSchema();
            createSpy = sinon.stub().returns(Promise.resolve(mockResult));
            modelManager.create = createSpy;
        });

        it('Values are hydrated as expected', async () => {
            const query = `
                mutation {
                    ModelWithAllScalarFields_create(model: {
                        integerField: 1,
                        numberField: 2.34,
                        textField: "graphql is nice",
                        booleanField: true,
                        selectField: "Y",
                        multiSelectField: ["A", "B"],
                        dateField: "2018-01-02",
                        timeField: "11:58:00",
                        dateTimeField: "2018-02-06T16:01:27"
                    })
                }
            `;
            await graphql(schema, query);
            expect(createSpy.callCount).to.equal(1);
            expect(createSpy.getCall(0).args).to.deep.equal([
                new models.ModelWithAllScalarFields({
                    integerField: 1,
                    numberField: 2.34,
                    textField: 'graphql is nice',
                    booleanField: true,
                    selectField: 'Y',
                    multiSelectField: ['A', 'B'],
                    dateField: '2018-01-02',
                    timeField: '11:58:00',
                    dateTimeField: '2018-02-06T16:01:27'
                })
            ]);
        });

    });
});
