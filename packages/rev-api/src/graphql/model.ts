import { GraphQLObjectTypeConfig, GraphQLString } from 'graphql';
import { IModelMeta } from 'rev-models';

export function getModelConfig(meta: IModelMeta<any>): GraphQLObjectTypeConfig<any, any> {
    let config = {
        name: meta.name,
        fields: {}
    };
    for (let field of meta.fields) {
        config.fields[field.name] = {
            type: GraphQLString,
            resolve() {
                return 'Test result';
            }
        };
    }
    return config;
}
