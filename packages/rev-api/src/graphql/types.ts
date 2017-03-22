import { GraphQLObjectType, GraphQLString } from 'graphql';

export const DummyModelType = new GraphQLObjectType({
    name: 'DummyModel',
    fields: {
        name: {
            type: GraphQLString,
            resolve(root: any, args: any, context: any) {
                return 'TODO: Replace with real models!';
            }
        }
    },
});
