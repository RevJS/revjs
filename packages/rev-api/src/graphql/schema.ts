
import { ModelApiManager } from '../api/manager';
import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import { GraphQLSchemaConfig } from 'graphql/type/schema';
import { getQueryConfig } from './query';
import { getMutationConfig } from './mutation';

export function getGraphQLSchema(manager: ModelApiManager): GraphQLSchema {

    const schema: GraphQLSchemaConfig = {} as any;

    const queryConfig = getQueryConfig(manager);
    const mutationConfig = getMutationConfig(manager);

    schema.query = new GraphQLObjectType(queryConfig);
    if (mutationConfig) {
        schema.mutation = new GraphQLObjectType(mutationConfig);
    }

    return new GraphQLSchema(schema);
}
