import { GraphQLFieldConfigMap, GraphQLNonNull, GraphQLResolveInfo } from 'graphql';
import { IApiMeta } from '../../api/types';
import * as GraphQLJSON from 'graphql-type-json';
import { IGraphQLApi } from '../types';
import { IModel, fields, ValidationError } from 'rev-models';

export function getModelOperationMutations(api: IGraphQLApi, meta: IApiMeta): GraphQLFieldConfigMap<any, any> {
    const modelManager = api.getModelManager();
    const modelMeta = modelManager.getModelMeta(meta.model);
    const mutations = {};

    async function hydrateRelatedModelFields(model: IModel, data: any) {
        for (const field of modelMeta.fields) {
            if (typeof data[field.name] != 'undefined' && field instanceof fields.RelatedModelField) {
                if (data[field.name] === null) {
                    model[field.name] = null;
                }
                else {
                    const relatedModel = field.options.model;
                    const relatedMeta = modelManager.getModelMeta(relatedModel);
                    const relatedPKField = relatedMeta.fieldsByName[relatedMeta.primaryKey!].name;
                    const res = await modelManager.read(relatedMeta.ctor, {
                        where: { [relatedPKField]: data[field.name] },
                        limit: 1
                    });
                    if (res.meta.totalCount == 1) {
                        model[field.name] = res.results![0];
                    }
                }
            }
        }
    }

    for (let operationName of meta.operations) {

        if (operationName == 'create') {
            let mutationName = meta.model + '_create';
            mutations[mutationName] = {
                type: GraphQLJSON,
                args: {
                    model: { type: new GraphQLNonNull(api.getModelInputObject(meta.model)) }
                },
                resolve: async (rootValue: any, args: any, context: any, info: GraphQLResolveInfo) => {
                    const model = modelManager.hydrate(modelMeta.ctor, args.model);
                    await hydrateRelatedModelFields(model, args.model);
                    return modelManager.create(model)
                        .catch((e) => {
                            if (e instanceof ValidationError) {
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
                resolve: async (rootValue: any, args: any, context: any, info: GraphQLResolveInfo) => {
                    const model = modelManager.hydrate(modelMeta.ctor, args.model);
                    await hydrateRelatedModelFields(model, args.model);
                    const options = args.where ? { where: args.where } : undefined;
                    return modelManager.update(model, options)
                        .catch((e) => {
                            if (e instanceof ValidationError) {
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