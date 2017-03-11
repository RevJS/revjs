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

    for (let modelName of registry.getModelNames()) {
        schema[modelName] = new GraphQLObjectType({
            name: modelName + ' Mutations',
            fields: {
                create: {
                    type: MutationResultType,
                    args: {
                        id: { type: new GraphQLNonNull(GraphQLInt) }
                    },
                    resolve: (value, { id }) => {
                        return {
                            status: 'test'
                        };
                    }
                }
            },
        });
    }

    return new GraphQLSchema(schema);
}
