
import * as models from '../../__tests__/../__fixtures__/models';
import { ModelApiManager } from '../../../api/manager';

import { expect } from 'chai';
import { getMutationConfig } from '../mutation';

describe('getMutationConfig()', () => {

    describe('API with operations', () => {
        let api: ModelApiManager;

        before(() => {
            api = new ModelApiManager(models.getModelManager());
            api.register(models.User, { operations: ['read', 'update'] });
            api.register(models.Post, { operations: ['create', 'read', 'update', 'remove'] });
        });

        it('should register all User operations', () => {
            let mutations = getMutationConfig(api);
            expect(mutations.fields['User_update']).to.exist;
        });

        it('should not register User_read operation', () => {
            let mutations = getMutationConfig(api);
            expect(mutations.fields['User_read']).to.not.exist;
        });

        it('should register all Post operations', () => {
            let mutations = getMutationConfig(api);
            expect(mutations.fields['Post_create']).to.exist;
            expect(mutations.fields['Post_update']).to.exist;
            expect(mutations.fields['Post_remove']).to.exist;
        });

        it('should not register Post_read operation', () => {
            let mutations = getMutationConfig(api);
            expect(mutations.fields['Post_read']).to.not.exist;
        });

    });

    describe('API with custom methods', () => {
        let api: ModelApiManager;

        before(() => {
            api = new ModelApiManager(models.getModelManager());
            api.register(models.User, { methods: { userMethod1: {} } });
            api.register(models.Post, { methods: { postMethod1: {} } });
        });

        it('should register all User methods', () => {
            let mutations = getMutationConfig(api);
            expect(mutations.fields['User_userMethod1']).to.exist;
        });

        it('should register all Post methods', () => {
            let mutations = getMutationConfig(api);
            expect(mutations.fields['Post_postMethod1']).to.exist;
        });

    });

    describe('API with operations and custom methods', () => {
        let api: ModelApiManager;

        before(() => {
            api = new ModelApiManager(models.getModelManager());
            api.register(models.Post, {
                operations: ['create', 'update'],
                methods: {
                    postMethod1: {}
                }});
        });

        it('should register all Post methods', () => {
            let mutations = getMutationConfig(api);
            expect(mutations.fields['Post_create']).to.exist;
            expect(mutations.fields['Post_update']).to.exist;
            expect(mutations.fields['Post_postMethod1']).to.exist;
        });

    });

});
