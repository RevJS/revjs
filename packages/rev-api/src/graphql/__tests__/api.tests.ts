
import * as models from '../__fixtures__/models';
import { ModelApiManager } from '../../api/manager';
import { GraphQLApi } from '../api';

import { expect } from 'chai';

describe('GraphQLApi class', () => {
    let manager: ModelApiManager;
    let api: GraphQLApi;

    beforeEach(() => {
        manager = new ModelApiManager(models.getModelManager());
    });

    describe('constructor()', () => {

        it('successfully creates a manager', () => {
            expect(() => {
                api = new GraphQLApi(manager);
            }).to.not.throw();
            expect(api.getApiManager()).to.equal(manager);
        });

        it('throws if not passed a ModelManager', () => {
            expect(() => {
                api = new GraphQLApi(null);
            }).to.throw('Invalid ModelApiManager passed in constructor');
        });

    });

});
