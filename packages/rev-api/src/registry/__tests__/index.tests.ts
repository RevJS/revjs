import { IModelMeta } from 'rev-models/models';
// import { ModelOperationType } from 'rev-models/models';
import * as f from 'rev-models/fields';
import * as registry from '../index';
import { ModelRegistry, registry as revRegistry } from 'rev-models/registry';

import { IApiMeta } from '../../api/meta';

import { expect } from 'chai';

class TestModel {
    id: number = 1;
    name: string = 'A Test Model';
    date: Date = new Date();
}

let testMeta: IModelMeta<TestModel> = {
    fields: [
        new f.IntegerField('id', 'Id'),
        new f.TextField('name', 'Name'),
        new f.DateField('date', 'Date')
    ]
};

let apiMeta: IApiMeta;

describe('ModelApiRegistry', () => {
    let testModelReg: ModelRegistry;
    let testReg: registry.ModelApiRegistry;

    beforeEach(() => {
        testModelReg = new ModelRegistry();
        revRegistry.clearRegistry();
        testReg = new registry.ModelApiRegistry();
        apiMeta = {
            operations: [ 'read' ]
        };
    });

    describe('constructor()', () => {

        it('successfully creates a registry', () => {
            expect(() => {
                testReg = new registry.ModelApiRegistry();
            }).to.not.throw();
            expect(testReg.getModelRegistry()).to.equal(revRegistry);
        });

        it('successfully creates a registry with a specific modelRegistry', () => {
            expect(() => {
                testReg = new registry.ModelApiRegistry(testModelReg);
            }).to.not.throw();
            expect(testReg.getModelRegistry()).to.equal(testModelReg);
        });

    });

    describe('isRegistered()', () => {

        it('returns false when a model is not registered', () => {
            expect(testReg.isRegistered('TestModel')).to.equal(false);
        });

        it('returns true when a model is registered', () => {
            revRegistry.register(TestModel, testMeta);
            testReg.register(TestModel, apiMeta);
            expect(testReg.isRegistered('TestModel')).to.equal(true);
        });

        it('returns false when a non-string is passed for modelName', () => {
            expect(testReg.isRegistered(<any> 22)).to.equal(false);
        });

        it('returns false when an object is passed for modelName', () => {
            expect(testReg.isRegistered(<any> {test: 1})).to.equal(false);
        });

    });

    describe('register()', () => {

        it('adds a valid api to the registry', () => {
            revRegistry.register(TestModel, testMeta);
            testReg.register(TestModel, apiMeta);
            expect(testReg.getApiMeta('TestModel')).to.equal(apiMeta);
        });

        it('rejects a non-model constructor with a ModelError', () => {
            expect(() => {
                testReg.register(<any> {}, apiMeta);
            }).to.throw('ModelError');
        });

        it('throws an error if model has not been registered', () => {
            expect(() => {
                testReg.register(TestModel, apiMeta);
            }).to.throw(`Model 'TestModel' has not been registered`);
        });

        it('throws an error if model already has an api registered', () => {
            revRegistry.register(TestModel, testMeta);
            testReg.register(TestModel, apiMeta);
            expect(() => {
                testReg.register(TestModel, apiMeta);
            }).to.throw(`Model 'TestModel' already has a registered API`);
        });

        it('throws an error if api metadata is invalid', () => {
            revRegistry.register(TestModel, testMeta);
            expect(() => {
                testReg.register(TestModel, <any> {});
            }).to.throw(`ApiMetadataError`);
        });

    });

    describe('getApiMeta()', () => {

        it('should return requested api meta', () => {
            revRegistry.register(TestModel, testMeta);
            testReg.register(TestModel, apiMeta);
            expect(testReg.getApiMeta('TestModel')).to.equal(apiMeta);
        });

        it('should throw an error if the model does not have an api defined', () => {
            revRegistry.register(TestModel, testMeta);
            expect(() => {
                testReg.getApiMeta('TestModel');
            }).to.throw(`Model 'TestModel' does not have a registered API`);
        });

    });

    describe('rev-forms.registry', () => {

        it('should be an instance of ModelRegistry', () => {
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
