import { IModelApiManager } from '../../api/types';
import { GraphQLObjectTypeConfig } from 'graphql';
import { getModelOperationMutations } from './operations';
import { getModelMethodMutations } from './methods';

export function getMutationConfig(manager: IModelApiManager): GraphQLObjectTypeConfig<any, any> {

    let mutations = {
        name: 'mutation',
        fields: {}
    };

    for (let modelName of manager.getModelNames()) {

        let meta = manager.getApiMeta(modelName);

        let operationMutations = getModelOperationMutations(manager, meta);
        let methodMutations = getModelMethodMutations(manager, meta);

        Object.assign(mutations.fields, operationMutations, methodMutations);

    }

    if (Object.keys(mutations.fields).length > 0) {
        return mutations;
    }

}