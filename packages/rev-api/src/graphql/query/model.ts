import { GraphQLObjectTypeConfig } from 'graphql';
import { getFieldResolver } from './resolve_field';
import { IModelApiManager, IGraphQLApiMeta } from '../../api/types';

export function getModelConfig(manager: IModelApiManager, gqlMeta: IGraphQLApiMeta, modelName: string): GraphQLObjectTypeConfig<any, any> {
    let meta = manager.getModelManager().getModelMeta(modelName);
    let config = {
        name: modelName,
        fields: {}
    };
    for (let field of meta.fields) {
        config.fields[field.name] = {
            type: gqlMeta.getGraphQLScalarType(field),
            resolve: getFieldResolver(meta, field.name)
        };
    }
    return config;
}
