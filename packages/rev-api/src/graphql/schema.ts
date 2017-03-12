import { ModelApiRegistry } from '../registry/index';
import { IModelOperationResult } from 'rev-models/lib/models';

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

import { NoModelsType, DummyModelType } from './types';


export function getGraphQLSchema(registry: ModelApiRegistry): GraphQLSchema {

    const schema: any = {};

    let readModels = registry.getModelNamesByMethod('read');

    let queries = {
        name: 'query',
        fields: {}
    };
    if (readModels.length == 0) {
        queries.fields['no_models'] = {
            type: NoModelsType
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
    }
    if (Object.keys(mutations.fields).length > 0) {
        schema.mutation = new GraphQLObjectType(mutations);
    }

    return new GraphQLSchema(schema);
}
