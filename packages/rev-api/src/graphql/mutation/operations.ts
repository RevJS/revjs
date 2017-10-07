import { GraphQLFieldConfigMap, GraphQLNonNull, GraphQLInt } from 'graphql';
import { IApiMeta } from '../../api/meta';
import * as GraphQLJSON from 'graphql-type-json';
import { ModelApiManager } from '../../api/manager';

export function getModelOperationMutations(manager: ModelApiManager, meta: IApiMeta): GraphQLFieldConfigMap<any, any> {
    let fields = {};

    for (let operationName of meta.operations) {
        if (operationName != 'read') {
            let mutationName = meta.model + '_' + operationName;
            fields[mutationName] = {
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

    return fields;
}