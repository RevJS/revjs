import { GraphQLObjectTypeConfig } from 'graphql';
import { getModelOperationMutations } from './operations';
import { getModelMethodMutations } from './methods';
import { IGraphQLApi } from '../types';

export function getMutationConfig(api: IGraphQLApi) {

    let mutations = {
        name: 'mutation',
        fields: {}
    };
    const manager = api.getApiManager();

    for (let modelName of manager.getModelNames()) {

        let meta = manager.getApiMeta(modelName);

        let operationMutations = getModelOperationMutations(api, meta);
        let methodMutations = getModelMethodMutations(api, meta);

        Object.assign(mutations.fields, operationMutations, methodMutations);

    }

    if (Object.keys(mutations.fields).length > 0) {
        return mutations;
    }

}