import { ModelApiRegistry } from '../registry/registry';
import { IModelOperationResult } from 'rev-models/lib/operations/operationresult';

import {
    GraphQLObjectType,
    GraphQLNonNull,
    // GraphQLString,
    GraphQLInt,
    // GraphQLBoolean,
    // GraphQLList,
    GraphQLSchema
} from 'graphql';

import * as GraphQLJSON from 'graphql-type-json';

import { DummyModelType } from './types';
import { GraphQLString } from 'graphql';


export function getGraphQLSchema(registry: ModelApiRegistry): GraphQLSchema {

    const schema: any = {};

    let readModels = registry.getModelNamesByOperation('read');

    let queries = {
        name: 'query',
        fields: {}
    };
    if (readModels.length == 0) {
        queries.fields['no_models'] = {
            type: GraphQLString,
            resolve() {
                return 'No models have been registered for read access';
            }
        };
    }
    else {
        for (let modelName of readModels) {
            queries.fields[modelName] = {
                type: DummyModelType,
                args: {
                    id: { type: GraphQLInt }
                },
                resolve(root: any, args: any, context: any) {
                    console.log('WHERE', args['where']);
                    return {};
                }
            };
        }
    }
    schema.query = new GraphQLObjectType(queries);

    let mutations = {
        name: 'mutation',
        fields: {}
    };
    for (let modelName of registry.getModelNames()) {
        let meta = registry.getApiMeta(modelName);
        for (let methodName in meta.methods) {
            let mutationName = modelName + '_' + methodName;
            mutations.fields[mutationName] = {
                type: GraphQLJSON,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLInt) }
                },
                resolve: (value: any, args: any): IModelOperationResult<any, any> => {
                    return {
                        operation: {
                            operation: 'create'
                        },
                        success: false
                    };
                }
            };
        }
    }
    if (Object.keys(mutations.fields).length > 0) {
        schema.mutation = new GraphQLObjectType(mutations);
    }

    return new GraphQLSchema(schema);
}
