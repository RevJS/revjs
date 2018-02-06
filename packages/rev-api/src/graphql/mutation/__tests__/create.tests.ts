
import { expect } from 'chai';
import { ModelApiManager } from '../../../api/manager';
import * as models from '../../__fixtures__/models';
import { graphql, GraphQLSchema } from 'graphql';
import { GraphQLApi } from '../../api';

describe('GraphQL "mutation" type - Model_create()', () => {

    describe('Method Signature', () => {
        let manager: ModelApiManager;
        let api: GraphQLApi;
        let schema: GraphQLSchema;
        let signature: any;

        before(async () => {
            manager = new ModelApiManager(models.getModelManager());
            manager.register(models.Post, { operations: ['create'] });
            api = new GraphQLApi(manager);
            schema = api.getSchema();

            const query = `
                query {
                    __schema {
                        mutationType {
                            fields {
                                name
                                args {
                                    name
                                    type {
                                        kind,
                                        ofType {
                                            name
                                            kind
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;

            const result = await graphql(schema, query);
            signature = result.data.__schema.mutationType.fields[0];
        });

        it('Mutation name is the model name plus _create', async () => {
            expect(signature.name).to.equal('Post_create');
        });

        it('takes a single, non-nullable "model" argument', () => {
            expect(signature.args).to.have.length(1);
            expect(signature.args[0].name).to.equal('model');
            expect(signature.args[0].type.kind).to.equal('NON_NULL');
            expect(signature.args[0].type.ofType.name).to.equal('Post_input');
            expect(signature.args[0].type.ofType.kind).to.equal('INPUT_OBJECT');
        });

    });

});
