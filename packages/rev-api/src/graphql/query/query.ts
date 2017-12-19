import { ModelApiManager } from '../../api/manager';
import { GraphQLString, GraphQLObjectTypeConfig, GraphQLObjectType, GraphQLList } from 'graphql';
import { getModelConfig } from './model';
import * as GraphQLJSON from 'graphql-type-json';
import { getModelResolver } from './resolve_model';

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
            let modelConfig = getModelConfig(manager, modelName);
            queries.fields[modelName] = {
                type: new GraphQLList(new GraphQLObjectType(modelConfig)),
                args: {
                    where: { type: GraphQLJSON }
                },
                resolve: getModelResolver(manager, modelName)
            };
        }
    }
    return queries;
}
