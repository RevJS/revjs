
import { expect } from 'chai';
import { ModelApiManager } from '../../../api/manager';
import { modelManager } from '../../__tests__/models.fixture';
import { graphql, GraphQLSchema } from 'graphql';
import { getGraphQLSchema } from '../../schema';

describe.only('GraphQL "query" type', () => {

    describe('When no models are registered', () => {
        let api: ModelApiManager;
        let schema: GraphQLSchema;

        before(() => {
            api = new ModelApiManager(modelManager);
            schema = getGraphQLSchema(api);
        });

        it('API should not have any models available for read', () => {
            expect(api.getModelNamesByOperation('read')).to.have.length(0);
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

});
