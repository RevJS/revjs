import { GraphQLFieldConfigMap, GraphQLNonNull, GraphQLResolveInfo } from 'graphql';
import { IApiMeta } from '../../api/types';
import * as GraphQLJSON from 'graphql-type-json';
import { IGraphQLApi } from '../types';

export function getModelOperationMutations(api: IGraphQLApi, meta: IApiMeta): GraphQLFieldConfigMap<any, any> {
    const modelManager = api.getModelManager();
    const modelMeta = modelManager.getModelMeta(meta.model);
    const mutations = {};

    for (let operationName of meta.operations) {

        if (operationName == 'create') {
            let mutationName = meta.model + '_create';
            mutations[mutationName] = {
                type: GraphQLJSON,
                args: {
                    model: { type: new GraphQLNonNull(api.getModelInputObject(meta.model)) }
                },
                resolve: (rootValue: any, args: any, context: any, info: GraphQLResolveInfo) => {
                    const model = modelManager.hydrate(modelMeta.ctor, args.model);
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
            };
        }
        else if (operationName == 'update') {
            let mutationName = meta.model + '_update';
            mutations[mutationName] = {
                type: GraphQLJSON,
                args: {
                    model: { type: new GraphQLNonNull(api.getModelInputObject(meta.model)) },
                    where: { type: GraphQLJSON }
                },
                resolve: (rootValue: any, args: any, context: any, info: GraphQLResolveInfo) => {
                    const model = modelManager.hydrate(modelMeta.ctor, args.model);
                    const options = args.where ? { where: args.where } : undefined;
                    return modelManager.update(model, options)
                        .catch((e) => {
                            if (e.message == 'ValidationError') {
                                return e.result;
                            }
                            else {
                                throw e;
                            }
                        });
                }
            };
        }
        else if (operationName == 'remove') {
            let mutationName = meta.model + '_remove';
            mutations[mutationName] = {
                type: GraphQLJSON,
                args: {
                    where: { type: new GraphQLNonNull(GraphQLJSON) }
                },
                resolve: (rootValue: any, args: any, context: any, info: GraphQLResolveInfo) => {
                    const model = new modelMeta.ctor();
                    return modelManager.remove(model, {
                        where: args.where
                    });
                }
            };
        }
        else if (operationName != 'read') {
            throw new Error('Unrecognised operation: ' + operationName);
        }

    }

    return mutations;
}