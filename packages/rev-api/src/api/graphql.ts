import { ModelApiRegistry } from '../registry/index';

import {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
    // GraphQLBoolean,
    // GraphQLList,
    GraphQLSchema
} from 'graphql';

export function getGraphQLSchema(registry: ModelApiRegistry): GraphQLSchema {

    const schema: any = {};

    const ModelType = new GraphQLObjectType({
        name: 'SomeModel',
        fields: {
            name: {
                type: GraphQLString,
                resolve(root: any, args: any, context: any) {
                    return 'test name';
                }
            }
        },
    });
    let queries = {
        name: 'query',
        fields: {}
    };
    for (let modelName of registry.getModelNames()) {
        queries.fields[modelName] = {
            type: ModelType,
            args: {
                id: { type: GraphQLInt }
            },
            resolve(root: any, args: any, context: any) {
                console.log('WHERE', args['where']);
                return {};
            }
        };
    }
    schema.query = new GraphQLObjectType(queries);


    const MutationResultType = new GraphQLObjectType({
        name: 'MutationResultType',
        fields: {
            status: {
                type: GraphQLString,
                resolve(root, args, context) {
                    return 'done';
                }
            }
        }
    });
    let mutations = {
        name: 'mutation',
        fields: {}
    };
    for (let modelName of registry.getModelNames()) {
        let mutationName = modelName + '_create';
        mutations.fields[mutationName] = {
            type: MutationResultType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve: (value: any, args: any) => {
                return {
                    status: 'test'
                };
            }
        };
    }
    schema.mutation = new GraphQLObjectType(mutations);

    return new GraphQLSchema(schema);
}
