import { IGraphQLApi } from '../../api/types';
import { GraphQLString, GraphQLObjectTypeConfig, GraphQLList } from 'graphql';
import * as GraphQLJSON from 'graphql-type-json';

export function getQueryConfig(api: IGraphQLApi): GraphQLObjectTypeConfig<any, any> {

    const readModels = api.getReadableModels();
    const models = api.getModelManager();

    const queries = {
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
            let modelType = api.getModelObjectType(modelName);

            queries.fields[modelName] = {
                type: new GraphQLList(modelType),
                args: {
                    where: { type: GraphQLJSON }
                },
                resolve: (value: any, args: any, context: any): Promise<any> => {
                    let modelMeta = models.getModelMeta(modelName);

                    return models.read(modelMeta.ctor, {})
                        .then((res) => {
                            return res.results;
                        });
                }
            };
        }
    }
    return queries;
}
