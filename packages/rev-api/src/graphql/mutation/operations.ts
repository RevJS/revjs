import { GraphQLFieldConfigMap, GraphQLNonNull, GraphQLResolveInfo } from 'graphql';
import { IApiMeta } from '../../api/types';
import * as GraphQLJSON from 'graphql-type-json';
import { IGraphQLApi } from '../types';

export function getModelOperationMutations(api: IGraphQLApi, meta: IApiMeta): GraphQLFieldConfigMap<any, any> {
    let fields = {};

    for (let operationName of meta.operations) {
        if (operationName != 'read') {
            let mutationName = meta.model + '_' + operationName;
            fields[mutationName] = {
                type: GraphQLJSON,
                args: {
                    model: { type: new GraphQLNonNull(api.getModelInputObject(meta.model)) }
                },
                resolve: (rootValue: any, args: any, context: any, info: GraphQLResolveInfo) => {
                    return {
                        success: true
                    };
                }
            };
        }
    }

    return fields;
}