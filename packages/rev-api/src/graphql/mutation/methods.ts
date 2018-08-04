import { IApiMeta } from '../../api/types';
import { GraphQLFieldConfigMap, GraphQLNonNull, GraphQLString, GraphQLFieldConfigArgumentMap } from 'graphql';
import * as GraphQLJSON from 'graphql-type-json';
import { getMethodResolver } from './resolve_method';
import { IGraphQLApi } from '../types';

export function getModelMethodMutations(api: IGraphQLApi, meta: IApiMeta): GraphQLFieldConfigMap<any, any> {
    let fields: GraphQLFieldConfigMap<any, any> = {};

    for (let methodName in meta.methods) {
        let mutationName = meta.model + '_' + methodName;
        let methodMeta = meta.methods[methodName];

        let argsConfig: GraphQLFieldConfigArgumentMap = {};

        if (methodMeta.modelData) {
            let modelInputType = api.getModelInputObject(meta.model);
            argsConfig['model'] = {
                type: new GraphQLNonNull(modelInputType)
            };
        }

        if (methodMeta.args) {
            for (let arg of methodMeta.args) {
                argsConfig[arg.name] = {
                    type: new GraphQLNonNull(GraphQLString)
                };
            }
        }

        fields[mutationName] = {
            type: GraphQLJSON,
            args: argsConfig,
            resolve: getMethodResolver(api.getApiManager(), meta.model, methodName)
        };
    }

    return fields;
}