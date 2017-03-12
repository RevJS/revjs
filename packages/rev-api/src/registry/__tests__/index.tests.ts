import { IModelMeta } from 'rev-models/lib/models';
// import { ModelOperationType } from 'rev-models/models';
import * as f from 'rev-models/lib/fields';
import * as registry from '../index';
import { ModelRegistry, registry as revRegistry } from 'rev-models/lib/registry';

import * as rewire from 'rewire';
import * as sinon from 'sinon';

import { IApiMetaDefinition } from '../../api/meta';

import { expect } from 'chai';

class TestModel {
    id: number = 1;
    name: string = 'A Test Model';
    date: Date = new Date();
}

let testMeta: IModelMeta<TestModel> = {
    fields: [
        new f.IntegerField('id'),
        new f.TextField('name'),
        new f.DateField('date')
    ]
};

let apiMeta: IApiMetaDefinition;

describe('ModelApiRegistry', () => {
    let testModelReg: ModelRegistry;
    let testApiReg: registry.ModelApiRegistry;

    beforeEach(() => {
        testModelReg = new ModelRegistry();
        revRegistry.clearRegistry();
        testApiReg = new registry.ModelApiRegistry();
        apiMeta = {
            methods: [ 'read' ]
        };
    });

    describe('constructor()', () => {

        it('successfully creates a registry', () => {
            expect(() => {
                testApiReg = new registry.ModelApiRegistry();
            }).to.not.throw();
            expect(testApiReg.getModelRegistry()).to.equal(revRegistry);
        });

        it('successfully creates a registry with a specific modelRegistry', () => {
            expect(() => {
                testApiReg = new registry.ModelApiRegistry(testModelReg);
            }).to.not.throw();
            expect(testApiReg.getModelRegistry()).to.equal(testModelReg);
        });

    });

    describe('isRegistered()', () => {

        it('returns false when a model is not registered', () => {
            expect(testApiReg.isRegistered('TestModel')).to.equal(false);
        });

        it('returns true when a model is registered', () => {
            revRegistry.register(TestModel, testMeta);
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
            revRegistry.register(TestModel, testMeta);
            testApiReg.register(TestModel, apiMeta);
            expect(testApiReg.getApiMeta('TestModel')).to.equal(apiMeta);
        });

        it('rejects a non-model constructor with a ModelError', () => {
            expect(() => {
                testApiReg.register({} as any, apiMeta);
            }).to.throw('ModelError');
        });

        it('throws an error if model has not been registered', () => {
            expect(() => {
                testApiReg.register(TestModel, apiMeta);
            }).to.throw(`Model 'TestModel' has not been registered`);
        });

        it('throws an error if model already has an api registered', () => {
            revRegistry.register(TestModel, testMeta);
            testApiReg.register(TestModel, apiMeta);
            expect(() => {
                testApiReg.register(TestModel, apiMeta);
            }).to.throw(`Model 'TestModel' already has a registered API`);
        });

        it('throws an error if api metadata is invalid', () => {
            revRegistry.register(TestModel, testMeta);
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
            revRegistry.register(TestModel, testMeta);
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
            revRegistry.register(TestModel, testMeta);
            testApiReg.register(TestModel, apiMeta);
            expect(testApiReg.getModelNamesByMethod('read')).to.deep.equal(['TestModel']);
        });

        it('does not return models that do not have the specified method registered', () => {
            apiMeta = {
                methods: [ 'create' ]
            }
            revRegistry.register(TestModel, testMeta);
            testApiReg.register(TestModel, apiMeta);
            expect(testApiReg.getModelNamesByMethod('read')).to.deep.equal([]);
        });

    });

    describe('getApiMeta()', () => {

        it('should return requested api meta', () => {
            revRegistry.register(TestModel, testMeta);
            testApiReg.register(TestModel, apiMeta);
            expect(testApiReg.getApiMeta('TestModel')).to.equal(apiMeta);
        });

        it('should throw an error if the model does not have an api defined', () => {
            revRegistry.register(TestModel, testMeta);
            expect(() => {
                testApiReg.getApiMeta('TestModel');
            }).to.throw(`Model 'TestModel' does not have a registered API`);
        });

    });

    describe('getGraphQLSchema()', () => {
        let rwRegistry = rewire('../index') as any;
        let schemaSpy = {
            getGraphQLSchema: sinon.stub().returns('test')
        };
        rwRegistry.__set__('schema_1', schemaSpy);

        it('should return result of external getGraphQLSchema function', () => {
            expect(schemaSpy.getGraphQLSchema.callCount).to.equal(0);
            let reg = new rwRegistry.ModelApiRegistry();
            expect(reg.getGraphQLSchema()).to.equal('test');
            expect(schemaSpy.getGraphQLSchema.callCount).to.equal(1);
            expect(schemaSpy.getGraphQLSchema.getCall(0).args[0]).to.equal(reg);
        });

    });

    describe('rev-api.registry', () => {

        it('should be an instance of ModelApiRegistry', () => {
            expect(registry.registry)
                .to.be.an.instanceOf(registry.ModelApiRegistry);
        });

    });

    describe('rev-api.register()', () => {

        it('should add model api meta to the shared registry', () => {
            revRegistry.register(TestModel, testMeta);
            registry.registry.register(TestModel, apiMeta);
            expect(registry.registry.getApiMeta('TestModel')).to.equal(apiMeta);
        });

        it('should throw an error if something goes wrong', () => {
            revRegistry.register(TestModel, testMeta);
            expect(() => {
                registry.registry.register(TestModel, apiMeta);
            }).to.throw(`Model 'TestModel' already has a registered API`);
        });

    });

});
