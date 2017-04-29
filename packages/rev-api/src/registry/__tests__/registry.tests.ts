
import * as rev from 'rev-models';
import * as registry from '../registry';

import * as rewire from 'rewire';
import * as sinon from 'sinon';

import { IApiDefinition } from '../../api/meta';

import { expect } from 'chai';

class TestModel extends rev.Model {
    @rev.IntegerField()
        id: number = 1;
    @rev.TextField()
        name: string = 'A Test Model';
    @rev.DateField()
        date: Date = new Date();
}

let apiMeta: IApiDefinition;

describe('ModelApiRegistry', () => {
    let modelReg: rev.ModelRegistry;
    let testApiReg: registry.ModelApiRegistry;

    beforeEach(() => {
        modelReg = new rev.ModelRegistry();
        modelReg.registerBackend('default', new rev.InMemoryBackend());
        testApiReg = new registry.ModelApiRegistry(modelReg);
        apiMeta = {
            methods: [ 'read' ]
        };
    });

    describe('constructor()', () => {

        it('successfully creates a registry', () => {
            expect(() => {
                testApiReg = new registry.ModelApiRegistry(modelReg);
            }).to.not.throw();
            expect(testApiReg.getModelRegistry()).to.equal(modelReg);
        });

    });

    describe('isRegistered()', () => {

        it('returns false when a model is not registered', () => {
            expect(testApiReg.isRegistered('TestModel')).to.equal(false);
        });

        it('returns true when a model is registered', () => {
            modelReg.register(TestModel);
            testApiReg.register(TestModel, apiMeta);
            expect(testApiReg.isRegistered('TestModel')).to.equal(true);
        });

        it('returns false when a non-string is passed for modelName', () => {
            expect(testApiReg.isRegistered(22 as any)).to.equal(false);
        });

        it('returns false when an object is passed for modelName', () => {
            expect(testApiReg.isRegistered({test: 1} as any)).to.equal(false);
        });

    });

    describe('register()', () => {

        it('adds a valid api to the registry', () => {
            modelReg.register(TestModel);
            testApiReg.register(TestModel, apiMeta);
            expect(testApiReg.getApiMeta('TestModel')).to.equal(apiMeta);
        });

        it('rejects a non-model constructor with a ModelError', () => {
            expect(() => {
                testApiReg.register({} as any, apiMeta);
            }).to.throw('RegistryError');
        });

        it('throws an error if model has not been registered', () => {
            expect(() => {
                testApiReg.register(TestModel, apiMeta);
            }).to.throw(`RegistryError`);
        });

        it('throws an error if model already has an api registered', () => {
            modelReg.register(TestModel);
            testApiReg.register(TestModel, apiMeta);
            expect(() => {
                testApiReg.register(TestModel, apiMeta);
            }).to.throw(`Model 'TestModel' already has a registered API`);
        });

        it('throws an error if api metadata is invalid', () => {
            modelReg.register(TestModel);
            expect(() => {
                testApiReg.register(TestModel, {} as any);
            }).to.throw(`ApiMetadataError`);
        });

    });

    describe('getModelNames()', () => {

        it('returns an empty list when no model APIs are registered', () => {
            expect(testApiReg.getModelNames()).to.deep.equal([]);
        });

        it('returns list of model names that have APIs registered', () => {
            modelReg.register(TestModel);
            testApiReg.register(TestModel, apiMeta);
            expect(testApiReg.getModelNames()).to.deep.equal(['TestModel']);
        });

    });

    describe('getModelNamesByMethod()', () => {

        it('returns an empty list when no model APIs are registered', () => {
            expect(testApiReg.getModelNamesByMethod('read')).to.deep.equal([]);
        });

        it('returns list of model names that have the specified method registered', () => {
            apiMeta = {
                methods: [ 'read' ]
            }
            modelReg.register(TestModel);
            testApiReg.register(TestModel, apiMeta);
            expect(testApiReg.getModelNamesByMethod('read')).to.deep.equal(['TestModel']);
        });

        it('does not return models that do not have the specified method registered', () => {
            apiMeta = {
                methods: [ 'create' ]
            }
            modelReg.register(TestModel);
            testApiReg.register(TestModel, apiMeta);
            expect(testApiReg.getModelNamesByMethod('read')).to.deep.equal([]);
        });

    });

    describe('getApiMeta()', () => {

        it('should return requested api meta', () => {
            modelReg.register(TestModel);
            testApiReg.register(TestModel, apiMeta);
            expect(testApiReg.getApiMeta('TestModel')).to.equal(apiMeta);
        });

        it('should throw an error if the model does not have an api defined', () => {
            modelReg.register(TestModel);
            expect(() => {
                testApiReg.getApiMeta('TestModel');
            }).to.throw(`Model 'TestModel' does not have a registered API`);
        });

    });

    describe('getGraphQLSchema()', () => {
        let rwRegistry = rewire('../registry') as any;
        let schemaSpy = {
            getGraphQLSchema: sinon.stub().returns('test')
        };
        rwRegistry.__set__('schema_1', schemaSpy);

        it('should return result of external getGraphQLSchema function', () => {
            expect(schemaSpy.getGraphQLSchema.callCount).to.equal(0);
            let reg = new rwRegistry.ModelApiRegistry(modelReg);
            expect(reg.getGraphQLSchema()).to.equal('test');
            expect(schemaSpy.getGraphQLSchema.callCount).to.equal(1);
            expect(schemaSpy.getGraphQLSchema.getCall(0).args[0]).to.equal(reg);
        });

    });

});
