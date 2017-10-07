import { IApiMeta } from '../../api/meta';
import { GraphQLFieldConfigMap, GraphQLInputObjectType } from 'graphql';
import * as GraphQLJSON from 'graphql-type-json';
import { IModelOperationResult } from 'rev-models';
import { getModelInputConfig } from './model';
import { ModelApiManager } from '../../api/manager';

export function getModelMethodMutations(manager: ModelApiManager, meta: IApiMeta): GraphQLFieldConfigMap<any, any> {
    let fields = {};

    for (let methodName in meta.methods) {
        let mutationName = meta.model + '_' + methodName;
        let modelType = getModelInputConfig(manager.modelManager.getModelMeta(meta.model));
        fields[mutationName] = {
            type: GraphQLJSON,
            args: {
                model: { type: new GraphQLInputObjectType(modelType) }
            },
            resolve: (value: any, args: any): IModelOperationResult<any, any> => {
                return {
                    operation: { operation: methodName },
                    success: true
                };
            }
        };
    }

    return fields;
}