import { ModelApiRegistry } from '../registry/index';
import { IModelOperationResult } from 'rev-models/lib/models';

import {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
    // GraphQLBoolean,
    // GraphQLList,
    GraphQLSchema
} from 'graphql';

import * as GraphQLJSON from 'graphql-type-json';

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

    let mutations = {
        name: 'mutation',
        fields: {}
    };
    for (let modelName of registry.getModelNames()) {
        let mutationName = modelName + '_create';
        mutations.fields[mutationName] = {
            type: GraphQLJSON,
            args: {
                id: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve: (value: any, args: any): IModelOperationResult<any> => {
                return {
                    operation: {
                        name: 'create'
                    },
                    success: false
                };
            }
        };
    }
    schema.mutation = new GraphQLObjectType(mutations);

    return new GraphQLSchema(schema);
}
