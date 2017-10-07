import { IApiMeta } from '../../api/meta';
import { GraphQLFieldConfigMap, GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import * as GraphQLJSON from 'graphql-type-json';
import { IModelOperationResult } from 'rev-models';
import { getModelInputConfig } from './model';
import { ModelApiManager } from '../../api/manager';

export function getModelMethodMutations(manager: ModelApiManager, meta: IApiMeta): GraphQLFieldConfigMap<any, any> {
    let fields = {};

    for (let methodName in meta.methods) {
        let mutationName = meta.model + '_' + methodName;
        let methodMeta = meta.methods[methodName];

        let modelTypeConfig = getModelInputConfig(manager.modelManager.getModelMeta(meta.model));
        let modelType: any = new GraphQLInputObjectType(modelTypeConfig);

        if (methodMeta.validateModel) {
            modelType = new GraphQLNonNull(modelType);
        }

        let config = {
            type: GraphQLJSON,
            args: {
                model: { type: modelType }
            },
            resolve: (value: any, args: any): IModelOperationResult<any, any> => {
                return {
                    operation: { operation: methodName },
                    success: true
                };
            }
        };

        if (methodMeta.args && methodMeta.args.length > 0) {
            for (let field of methodMeta.args) {
                config.args[field.name] = {
                    type: GraphQLString
                };
            }
        }

        fields[mutationName] = config;
    }

    return fields;
}