import { GraphQLObjectType, GraphQLString } from 'graphql';

export const NoModelsType = new GraphQLObjectType({
    name: 'NoModels',
    fields: {
        name: {
            type: GraphQLString,
            resolve() {
                return 'No models have been enabled for read';
            }
        }
    },
});

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
