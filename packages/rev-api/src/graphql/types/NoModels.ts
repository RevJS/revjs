import { GraphQLObjectType, GraphQLString } from 'graphql';

export const NoModelsObjectType = new GraphQLObjectType({
    name: 'query',
    fields: { no_models: {
        type: GraphQLString,
        resolve() {
            return 'No models have been registered for read access';
        }}
    }
});
