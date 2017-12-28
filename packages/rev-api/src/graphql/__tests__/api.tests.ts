
import * as models from './models.fixture';
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

    // describe('API with no models', () => {

    //     it('should register the root query type', () => {
    //         let schema = getGraphQLSchema(manager);
    //         expect(schema.getQueryType()).to.exist;
    //     });

    //     it('should register a single no_models field', () => {
    //         let schema = getGraphQLSchema(manager);
    //         let queryFields = schema.getQueryType().getFields();
    //         let fieldNames = Object.keys(queryFields);
    //         expect(fieldNames).to.deep.equal(['no_models']);
    //     });

    //     it('no_models field should return a static string', () => {
    //         let schema = getGraphQLSchema(manager);
    //         let queryFields = schema.getQueryType().getFields();
    //         expect(queryFields.no_models.type.toString()).to.equal('String');
    //         expect((queryFields.no_models as any).resolve()).to.equal('No models have been registered for read access');
    //     });

    // });

    // describe('API with readable models and no mutations', () => {

    //     beforeEach(() => {
    //         manager.register(models.User, { operations: ['read'] });
    //         manager.register(models.Post, { operations: ['read'] });
    //     });

    //     it('should register the root query type', () => {
    //         let schema = getGraphQLSchema(manager);
    //         expect(schema.getQueryType()).to.exist;
    //     });

    //     it('should register the models', () => {
    //         let schema = getGraphQLSchema(manager);
    //         let queryFields = schema.getQueryType().getFields();
    //         let fieldNames = Object.keys(queryFields);
    //         expect(fieldNames).to.deep.equal(['User', 'Post']);
    //     });

    //     it('should not register any mutations', () => {
    //         let schema = getGraphQLSchema(manager);
    //         let mutations = schema.getMutationType();
    //         expect(mutations).to.be.undefined;
    //     });

    // });

    // describe('API with readable models and mutations', () => {

    //     beforeEach(() => {
    //         manager.register(models.User, {
    //             operations: ['read'],
    //             methods: { userMethod1: {} }
    //         });
    //         manager.register(models.Post, {
    //             operations: ['create', 'read', 'update', 'remove'],
    //             methods: { postMethod1: {} }
    //         });
    //     });

    //     it('should register the root query type', () => {
    //         let schema = getGraphQLSchema(manager);
    //         expect(schema.getQueryType()).to.exist;
    //     });

    //     it('should register the models', () => {
    //         let schema = getGraphQLSchema(manager);
    //         let queryFields = schema.getQueryType().getFields();
    //         let fieldNames = Object.keys(queryFields);
    //         expect(fieldNames).to.deep.equal(['User', 'Post']);
    //     });

    //     it('should register the mutations', () => {
    //         let schema = getGraphQLSchema(manager);
    //         let mutations = schema.getMutationType().getFields();
    //         let mutationNames = Object.keys(mutations);
    //         expect(mutationNames).to.deep.equal([
    //             'User_userMethod1',
    //             'Post_create',
    //             'Post_update',
    //             'Post_remove',
    //             'Post_postMethod1'
    //         ]);
    //     });

    // });

});
