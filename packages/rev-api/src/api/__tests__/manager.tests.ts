
import * as rev from 'rev-models';

import rewire = require('rewire');
import * as sinon from 'sinon';

import { IApiDefinition } from '../../api/definition';

import { expect } from 'chai';
import { ModelApiManager } from '../manager';

class TestModel {
    @rev.IntegerField()
        id: number = 1;
    @rev.TextField()
        name: string = 'A Test Model';
    @rev.DateField()
        date: Date = new Date();
}

let apiMeta: IApiDefinition<TestModel>;

describe('ModelApiManager', () => {
    let models: rev.ModelManager;
    let testApi: ModelApiManager;

    beforeEach(() => {
        models = new rev.ModelManager();
        models.registerBackend('default', new rev.InMemoryBackend());
        testApi = new ModelApiManager(models);
        apiMeta = {
            model: TestModel,
            operations: [ 'read' ]
        };
    });

    describe('constructor()', () => {

        it('successfully creates a manager', () => {
            expect(() => {
                testApi = new ModelApiManager(models);
            }).to.not.throw();
            expect(testApi.getModelManager()).to.equal(models);
        });

        it('throws if not passed a ModelManager', () => {
            expect(() => {
                testApi = new ModelApiManager(null);
            }).to.throw('Invalid ModelManager passed in constructor');
        });

    });

    describe('isRegistered()', () => {

        it('returns false when a model is not registered', () => {
            expect(testApi.isRegistered('TestModel')).to.equal(false);
        });

        it('returns true when a model is registered', () => {
            models.register(TestModel);
            testApi.register(apiMeta);
            expect(testApi.isRegistered('TestModel')).to.equal(true);
        });

        it('returns false when a non-string is passed for modelName', () => {
            expect(testApi.isRegistered(22 as any)).to.equal(false);
        });

        it('returns false when an object is passed for modelName', () => {
            expect(testApi.isRegistered({test: 1} as any)).to.equal(false);
        });

    });

    describe('register()', () => {

        it('adds a valid api to the registry', () => {
            models.register(TestModel);
            testApi.register(apiMeta);
            expect(testApi.getApiMeta('TestModel')).to.equal(apiMeta);
        });

        it('rejects if api meta does not include a model constructor', () => {
            expect(() => {
                testApi.register({} as any);
            }).to.throw('ApiMetadataError');
        });

        it('throws an error if model has not been registered', () => {
            expect(() => {
                testApi.register(apiMeta);
            }).to.throw(`ManagerError`);
        });

        it('throws an error if model already has an api registered', () => {
            models.register(TestModel);
            testApi.register(apiMeta);
            expect(() => {
                testApi.register(apiMeta);
            }).to.throw(`Model 'TestModel' already has a registered API`);
        });

        it('throws an error if api metadata is invalid', () => {
            models.register(TestModel);
            expect(() => {
                testApi.register({} as any);
            }).to.throw(`ApiMetadataError`);
        });

    });

    describe('getModelNames()', () => {

        it('returns an empty list when no model APIs are registered', () => {
            expect(testApi.getModelNames()).to.deep.equal([]);
        });

        it('returns list of model names that have APIs registered', () => {
            models.register(TestModel);
            testApi.register(apiMeta);
            expect(testApi.getModelNames()).to.deep.equal(['TestModel']);
        });

    });

    describe('getModelNamesByOperation()', () => {

        it('returns an empty list when no model APIs are registered', () => {
            expect(testApi.getModelNamesByOperation('read')).to.deep.equal([]);
        });

        it('returns list of model names that have the specified method registered', () => {
            apiMeta = {
                model: TestModel,
                operations: [ 'read' ]
            };
            models.register(TestModel);
            testApi.register(apiMeta);
            expect(testApi.getModelNamesByOperation('read')).to.deep.equal(['TestModel']);
        });

        it('does not return models that do not have the specified method registered', () => {
            apiMeta = {
                model: TestModel,
                operations: [ 'create' ]
            };
            models.register(TestModel);
            testApi.register(apiMeta);
            expect(testApi.getModelNamesByOperation('read')).to.deep.equal([]);
        });

    });

    describe('getApiMeta()', () => {

        it('should return requested api meta', () => {
            models.register(TestModel);
            testApi.register(apiMeta);
            expect(testApi.getApiMeta('TestModel')).to.equal(apiMeta);
        });

        it('should throw an error if the model does not have an api defined', () => {
            models.register(TestModel);
            expect(() => {
                testApi.getApiMeta('TestModel');
            }).to.throw(`Model 'TestModel' does not have a registered API`);
        });

    });

    describe('getGraphQLSchema()', () => {
        let rwManager = rewire('../manager') as any;
        let schemaSpy = {
            getGraphQLSchema: sinon.stub().returns('test')
        };
        rwManager.__set__('schema_1', schemaSpy);

        it('should return result of external getGraphQLSchema function', () => {
            expect(schemaSpy.getGraphQLSchema.callCount).to.equal(0);
            let reg = new rwManager.ModelApiManager(models);
            expect(reg.getGraphQLSchema()).to.equal('test');
            expect(schemaSpy.getGraphQLSchema.callCount).to.equal(1);
            expect(schemaSpy.getGraphQLSchema.getCall(0).args[0]).to.equal(reg);
        });

    });

});
