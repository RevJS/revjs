import { GraphQLInputObjectTypeConfig, GraphQLString } from 'graphql';
import { IModelMeta } from 'rev-models';

export function getModelInputConfig(meta: IModelMeta<any>): GraphQLInputObjectTypeConfig {
    let config = {
        name: meta.name + '_input',
        fields: {}
    };
    for (let field of meta.fields) {
        config.fields[field.name] = {
            type: GraphQLString
        };
    }
    return config;
}
