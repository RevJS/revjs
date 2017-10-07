
import * as models from '../../__tests__/models.fixture';
import { ModelApiManager } from '../../../api/manager';

import { expect } from 'chai';
import { getQueryConfig } from '../query';
import { GraphQLString } from 'graphql';

describe('getQueryConfig()', () => {

    describe('API with no readable models', () => {
        let api: ModelApiManager;

        before(() => {
            api = new ModelApiManager(models.modelManager);
        });

        it('should not have any models available for read', () => {
            let readModels = api.getModelNamesByOperation('read');
            expect(readModels.length).to.equal(0);
        });

        it('should register a single no_models field', () => {
            let schema = getQueryConfig(api);
            expect(Object.keys(schema.fields)).to.deep.equal(['no_models']);
            expect(schema.fields['no_models'].type).to.equal(GraphQLString);
        });

        it('no_models field should return a static string', () => {
            let schema = getQueryConfig(api);
            expect(schema.fields['no_models'].resolve()).to.equal('No models have been registered for read access');
        });

    });

    describe('API with readable models', () => {
        let api: ModelApiManager;

        before(() => {
            api = new ModelApiManager(models.modelManager);
            api.register(models.User, { operations: ['read'] });
            api.register(models.Post, { operations: ['read'] });
        });

        it('should have two models available for read', () => {
            let readModels = api.getModelNamesByOperation('read');
            expect(readModels.length).to.equal(2);
        });

        it('should register each model', () => {
            let schema = getQueryConfig(api);
            expect(schema.fields['User']).to.exist;
            expect(schema.fields['Post']).to.exist;
        });

        it('should register each model as the model type', () => {
            let schema = getQueryConfig(api);
            expect(schema.fields['User'].type.name).to.equal('User');
            expect(schema.fields['Post'].type.name).to.equal('Post');
        });

    });

});
