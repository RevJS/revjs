import { GraphQLObjectType, GraphQLInt } from 'graphql';
import { IReadMeta } from 'rev-models/lib/models/types';

export const ApiReadMetaObjectType = new GraphQLObjectType({
    name: 'api_read_meta',
    fields: {
        limit: {
            type: GraphQLInt,
            resolve: (rootValue: IReadMeta) => rootValue.limit
        },
        offset: {
            type: GraphQLInt,
            resolve: (rootValue: IReadMeta) => rootValue.offset
        },
        totalCount: {
            type: GraphQLInt,
            resolve: (rootValue: IReadMeta) => rootValue.totalCount
        },
    }
});
