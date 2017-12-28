import { GraphQLObjectTypeConfig } from 'graphql';
import { IGraphQLApi } from '../../api/types';

export function getModelConfig(api: IGraphQLApi, modelName: string): GraphQLObjectTypeConfig<any, any> {
    let meta = api.getModelManager().getModelMeta(modelName);
    let config = {
        name: modelName,
        fields: {}
    };
    for (let field of meta.fields) {
        config.fields[field.name] = {
            type: api.getGraphQLScalarType(field),
            resolve: (value: any, args: any, context: any) => {
                return value[field.name];
            }
        };
    }
    return config;
}
