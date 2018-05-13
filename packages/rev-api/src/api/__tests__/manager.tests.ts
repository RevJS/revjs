
import * as rev from 'rev-models';

import { expect } from 'chai';
import { ModelApiManager } from '../manager';
import { ApiOperations, ApiMethod } from '../../decorators/decorators';

const testModelOperations = ['read', 'create'];
const testMethodMeta = { modelData: false };

@ApiOperations(testModelOperations)
class TestModel {

    @rev.IntegerField()
        id: number = 1;
    @rev.TextField()
        name: string = 'A Test Model';
    @rev.DateField()
        date: Date = new Date();

    @ApiMethod(testMethodMeta)
    testMethod() {
        // do stuff
    }
}

describe('ModelApiManager', () => {
    let models: rev.ModelManager;
    let testApi: ModelApiManager;

    beforeEach(() => {
        models = new rev.ModelManager();
        models.registerBackend('default', new rev.InMemoryBackend());
        testApi = new ModelApiManager(models);
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
                testApi = new ModelApiManager(undefined as any);
            }).to.throw('Invalid ModelManager passed in constructor');
        });

    });

    describe('isRegistered()', () => {

        it('returns false when a model is not registered', () => {
            expect(testApi.isRegistered('TestModel')).to.equal(false);
        });

        it('returns true when a model is registered', () => {
            models.register(TestModel);
            testApi.register(TestModel);
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
            testApi.register(TestModel, { model: 'TestModel' });
            expect(testApi.getApiMeta('TestModel')).to.deep.equal({
                model: 'TestModel',
                operations: testModelOperations,
                methods: {
                    testMethod: testMethodMeta
                }
            });
        });

        it('rejects if passed model is not a model constructor', () => {
            expect(() => {
                testApi.register({} as any);
            }).to.throw('Supplied model is not a model constructor');
        });

        it('throws an error if model has not been registered', () => {
            expect(() => {
                testApi.register(TestModel);
            }).to.throw(`ManagerError`);
        });

        it('throws an error if model already has an api registered', () => {
            models.register(TestModel);
            testApi.register(TestModel);
            expect(() => {
                testApi.register(TestModel);
            }).to.throw(`Model 'TestModel' already has a registered API`);
        });

        it('throws an error if api metadata is invalid', () => {
            models.register(TestModel);
            expect(() => {
                testApi.register(TestModel, { operations: ['flibble']});
            }).to.throw(`ApiMetadataError`);
        });

    });

    describe('getModelNames()', () => {

        it('returns an empty list when no model APIs are registered', () => {
            expect(testApi.getModelNames()).to.deep.equal([]);
        });

        it('returns list of model names that have APIs registered', () => {
            models.register(TestModel);
            testApi.register(TestModel);
            expect(testApi.getModelNames()).to.deep.equal(['TestModel']);
        });

    });

    describe('getModelNamesByOperation()', () => {

        it('returns an empty list when no model APIs are registered', () => {
            expect(testApi.getModelNamesByOperation('read')).to.deep.equal([]);
        });

        it('returns list of model names that have the specified method registered', () => {
            @ApiOperations(['read'])
            class TestModel2 {
                @rev.TextField()
                name: string;
            }
            models.register(TestModel2);
            testApi.register(TestModel2);
            expect(testApi.getModelNamesByOperation('read')).to.deep.equal(['TestModel2']);
        });

        it('does not return models that do not have the specified method registered', () => {
            @ApiOperations(['create'])
            class TestModel2 {
                @rev.TextField()
                name: string;
            }
            models.register(TestModel2);
            testApi.register(TestModel2);
            expect(testApi.getModelNamesByOperation('read')).to.deep.equal([]);
        });

    });

    describe('getApiMeta()', () => {

        it('should return requested api meta', () => {
            models.register(TestModel);
            testApi.register(TestModel);
            expect(testApi.getApiMeta('TestModel')).to.deep.equal({
                model: 'TestModel',
                operations: testModelOperations,
                methods: {
                    testMethod: testMethodMeta
                }
            });
        });

        it('should throw an error if the model does not have an api defined', () => {
            models.register(TestModel);
            expect(() => {
                testApi.getApiMeta('TestModel');
            }).to.throw(`Model 'TestModel' does not have a registered API`);
        });

    });

});
