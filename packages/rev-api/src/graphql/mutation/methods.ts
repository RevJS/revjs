import { IApiMeta, IModelApiManager } from '../../api/types';
import { GraphQLFieldConfigMap, GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLFieldConfigArgumentMap } from 'graphql';
import * as GraphQLJSON from 'graphql-type-json';
import { getModelInputConfig } from './model';
import { getMethodResolver } from './resolve_method';

export function getModelMethodMutations(manager: IModelApiManager, meta: IApiMeta): GraphQLFieldConfigMap<any, any> {
    let fields = {};

    for (let methodName in meta.methods) {
        let mutationName = meta.model + '_' + methodName;
        let methodMeta = meta.methods[methodName];

        let argsConfig: GraphQLFieldConfigArgumentMap = {};

        if (methodMeta.modelData) {
            let modelTypeConfig = getModelInputConfig(manager.getModelManager().getModelMeta(meta.model));
            argsConfig['model'] = {
                type: new GraphQLNonNull(new GraphQLInputObjectType(modelTypeConfig))
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
            resolve: getMethodResolver(manager, meta.model, methodName)
        };
    }

    return fields;
}