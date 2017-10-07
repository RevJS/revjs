import { ModelApiManager } from '../api/manager';
import { GraphQLObjectTypeConfig, GraphQLNonNull, GraphQLInt } from 'graphql';
import * as GraphQLJSON from 'graphql-type-json';

export function getMutationConfig(manager: ModelApiManager): GraphQLObjectTypeConfig<any, any> {

    let mutations = {
        name: 'mutation',
        fields: {}
    };

    for (let modelName of manager.getModelNames()) {

        let meta = manager.getApiMeta(modelName);

        for (let operationName of meta.operations) {
            if (operationName != 'read') {
                let mutationName = modelName + '_' + operationName;
                mutations.fields[mutationName] = {
                    type: GraphQLJSON,
                    args: {
                        id: { type: new GraphQLNonNull(GraphQLInt) }
                    },
                    resolve: (value: any, args: any) => {
                        return {
                            success: true
                        };
                    }
                };
            }
        }

        for (let methodName in meta.methods) {
            let mutationName = modelName + '_' + methodName;
            mutations.fields[mutationName] = {
                type: GraphQLJSON,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLInt) }
                },
                resolve: (value: any, args: any) => {
                    return {
                        success: true
                    };
                }
            };
        }
    }

    if (Object.keys(mutations.fields).length > 0) {
        return mutations;
    }

    return null;

}