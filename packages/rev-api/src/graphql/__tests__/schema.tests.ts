
import * as models from './models.fixture';
import { ModelApiManager } from '../../api/manager';
import { getGraphQLSchema } from '../schema';

import { expect } from 'chai';

describe('getGraphQLSchema()', () => {

    describe('API with no models', () => {
        let api: ModelApiManager;

        before(() => {
            api = new ModelApiManager(models.getModelManager());
        });

        it('should register the root query type', () => {
            let schema = getGraphQLSchema(api);
            expect(schema.getQueryType()).to.exist;
        });

        it('should register a single no_models field', () => {
            let schema = getGraphQLSchema(api);
            let queryFields = schema.getQueryType().getFields();
            let fieldNames = Object.keys(queryFields);
            expect(fieldNames).to.deep.equal(['no_models']);
        });

        it('no_models field should return a static string', () => {
            let schema = getGraphQLSchema(api);
            let queryFields = schema.getQueryType().getFields();
            expect(queryFields.no_models.type.toString()).to.equal('String');
            expect((queryFields.no_models as any).resolve()).to.equal('No models have been registered for read access');
        });

    });

    describe('API with readable models and no mutations', () => {
        let api: ModelApiManager;

        before(() => {
            api = new ModelApiManager(models.getModelManager());
            api.register(models.User, { operations: ['read'] });
            api.register(models.Post, { operations: ['read'] });
        });

        it('should register the root query type', () => {
            let schema = getGraphQLSchema(api);
            expect(schema.getQueryType()).to.exist;
        });

        it('should register the models', () => {
            let schema = getGraphQLSchema(api);
            let queryFields = schema.getQueryType().getFields();
            let fieldNames = Object.keys(queryFields);
            expect(fieldNames).to.deep.equal(['User', 'Post']);
        });

        it('should not register any mutations', () => {
            let schema = getGraphQLSchema(api);
            let mutations = schema.getMutationType();
            expect(mutations).to.be.undefined;
        });

    });

    describe('API with readable models and mutations', () => {
        let api: ModelApiManager;

        before(() => {
            api = new ModelApiManager(models.getModelManager());
            api.register(models.User, {
                operations: ['read'],
                methods: { userMethod1: {} }
            });
            api.register(models.Post, {
                operations: ['create', 'read', 'update', 'remove'],
                methods: { postMethod1: {} }
            });
        });

        it('should register the root query type', () => {
            let schema = getGraphQLSchema(api);
            expect(schema.getQueryType()).to.exist;
        });

        it('should register the models', () => {
            let schema = getGraphQLSchema(api);
            let queryFields = schema.getQueryType().getFields();
            let fieldNames = Object.keys(queryFields);
            expect(fieldNames).to.deep.equal(['User', 'Post']);
        });

        it('should register the mutations', () => {
            let schema = getGraphQLSchema(api);
            let mutations = schema.getMutationType().getFields();
            let mutationNames = Object.keys(mutations);
            expect(mutationNames).to.deep.equal([
                'User_userMethod1',
                'Post_create',
                'Post_update',
                'Post_remove',
                'Post_postMethod1'
            ]);
        });

    });

});
