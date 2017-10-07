import { ModelApiManager } from '../api/manager';
import { GraphQLString, GraphQLObjectTypeConfig, GraphQLObjectType } from 'graphql';
import { getModelConfig } from './model';
import * as GraphQLJSON from 'graphql-type-json';

export function getQueryConfig(manager: ModelApiManager): GraphQLObjectTypeConfig<any, any> {

    let readModels = manager.getModelNamesByOperation('read');

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
            let modelConfig = getModelConfig(manager.modelManager.getModelMeta(modelName));
            queries.fields[modelName] = {
                type: new GraphQLObjectType(modelConfig),
                args: {
                    where: { type: GraphQLJSON }
                },
                resolve(root: any, args: any, context: any) {
                    return {};
                }
            };
        }
    }
    return queries;
}
