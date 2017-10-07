
import * as models from '../../__tests__/models.fixture';
import { ModelApiManager } from '../../../api/manager';

import { expect } from 'chai';
import { getMutationConfig } from '../mutation';

describe('getModelMethodMutations()', () => {
    let api: ModelApiManager;

    before(() => {
        api = new ModelApiManager(models.modelManager);
        api.register(models.Post, { methods: { postMethod1: {} } });
    });

    it('should register all Post methods', () => {
        let mutations = getMutationConfig(api);
        expect(mutations.fields['Post_postMethod1']).to.exist;
    });

});
