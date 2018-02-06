import { GraphQLFieldConfigMap, GraphQLNonNull, GraphQLResolveInfo } from 'graphql';
import { IApiMeta } from '../../api/types';
import * as GraphQLJSON from 'graphql-type-json';
import { IGraphQLApi } from '../types';

export function getModelOperationMutations(api: IGraphQLApi, meta: IApiMeta): GraphQLFieldConfigMap<any, any> {
    const modelManager = api.getModelManager();
    const modelMeta = modelManager.getModelMeta(meta.model);
    const mutations = {};

    for (let operationName of meta.operations) {
        if (operationName != 'read') {
            let mutationName = meta.model + '_' + operationName;
            mutations[mutationName] = {
                type: GraphQLJSON,
                args: {
                    model: { type: new GraphQLNonNull(api.getModelInputObject(meta.model)) }
                },
                resolve: (rootValue: any, args: any, context: any, info: GraphQLResolveInfo) => {
                    const model = modelManager.hydrate(modelMeta.ctor, args.model);
                    if (operationName == 'create') {
                        return modelManager.create(model)
                            .catch((e) => {
                                if (e.message == 'ValidationError') {
                                    return e.result;
                                }
                                else {
                                    throw e;
                                }
                            });
                    }
                    else {
                        throw new Error('Unrecognised operation: ' + operationName);
                    }
                }
            };
        }
    }

    return mutations;
}