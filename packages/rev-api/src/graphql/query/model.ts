import { GraphQLObjectTypeConfig } from 'graphql';
import { getFieldResolver } from './resolve_field';
import { ModelApiManager } from '../../api/manager';

export function getModelConfig(manager: ModelApiManager, modelName: string): GraphQLObjectTypeConfig<any, any> {
    let meta = manager.modelManager.getModelMeta(modelName);
    let config = {
        name: modelName,
        fields: {}
    };
    for (let field of meta.fields) {
        config.fields[field.name] = {
            type: manager.getGraphQLScalarType(field),
            resolve: getFieldResolver(meta, field.name)
        };
    }
    return config;
}
