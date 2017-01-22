import { IModelMeta } from 'rev-models/models';
import * as f from 'rev-models/fields';
import * as registry from '../index';
import { registry as modelRegistry } from 'rev-models/registry';

import { IFormMeta } from '../../forms/meta';

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

let formMeta: IFormMeta;

describe('ModelRegistry', () => {
    let testReg: registry.ModelFormRegistry;

    beforeEach(() => {
        modelRegistry.clearRegistry();
        testReg = new registry.ModelFormRegistry();
        formMeta = {
            title: 'Test Form',
            fields: [ 'name', 'date' ]
        };
    });

    describe('constructor()', () => {

        it('successfully creates a registry', () => {
            expect(() => {
                testReg = new registry.ModelFormRegistry()
            }).to.not.throw();
        });

    });

    describe('isRegistered()', () => {

        it('returns false when a model is not registered', () => {
            expect(testReg.isRegistered('TestModel', 'default')).to.equal(false);
        });

        it('returns true when a model is registered', () => {
            modelRegistry.register(TestModel, testMeta);
            testReg.register(TestModel, 'default', formMeta);
            expect(testReg.isRegistered('TestModel', 'default')).to.equal(true);
        });

        it('returns false when a non-string is passed for modelName', () => {
            expect(testReg.isRegistered(<any> 22, 'default')).to.equal(false);
        });

        it('returns false when a non-string is passed for formName', () => {
            expect(testReg.isRegistered('TestModel', <any> 128)).to.equal(false);
        });

        it('returns false when an object is passed for modelName', () => {
            expect(testReg.isRegistered(<any> {test: 1}, 'default')).to.equal(false);
        });

        it('returns false when an object is passed for formName', () => {
            expect(testReg.isRegistered('TestModel', <any> {test: 1})).to.equal(false);
        });

    });

    describe('register()', () => {

        it('adds a valid form to the registry', () => {
            modelRegistry.register(TestModel, testMeta);
            testReg.register(TestModel, 'default', formMeta);
            expect(testReg.getForm('TestModel', 'default')).to.equal(formMeta);
        });

        it('rejects a non-model constructor with a ModelError', () => {
            expect(() => {
                testReg.register(<any> {}, 'default', formMeta);
            }).to.throw('ModelError');
        });

        it('throws an error if model has not been registered', () => {
            expect(() => {
                testReg.register(TestModel, 'default', formMeta);
            }).to.throw(`Model 'TestModel' has not been registered`);
        });

        it('throws an error if formName is empty', () => {
            modelRegistry.register(TestModel, testMeta);
            expect(() => {
                testReg.register(TestModel, '', formMeta);
            }).to.throw(`Invalid formName specified`);
        });

        it('throws an error if formName is not a string', () => {
            modelRegistry.register(TestModel, testMeta);
            expect(() => {
                testReg.register(TestModel, <any> 22, formMeta);
            }).to.throw(`Invalid formName specified`);
        });

        it('throws an error if specified form is already registered', () => {
            modelRegistry.register(TestModel, testMeta);
            testReg.register(TestModel, 'default', formMeta);
            expect(() => {
                testReg.register(TestModel, 'default', formMeta);
            }).to.throw(`Form 'default' is already defined for model 'TestModel'`);
        });

        it('throws an error if form metadata is invalid', () => {
            modelRegistry.register(TestModel, testMeta);
            expect(() => {
                testReg.register(TestModel, 'default', <any> {});
            }).to.throw(`FormMetadataError`);
        });

    });

    describe('getForms()', () => {

        it('returns all registered forms for the specified model', () => {
            modelRegistry.register(TestModel, testMeta);
            testReg.register(TestModel, 'default', formMeta);
            testReg.register(TestModel, 'login_form', formMeta);
            expect(testReg.getForms('TestModel')).to.deep.equal({
                default: formMeta,
                login_form: formMeta
            });
        });

        it('returns an empty dict if model is not defined', () => {
            expect(testReg.getForms('Fish')).to.deep.equal({});
        });

        it('returns an empty dict if model has no forms', () => {
            modelRegistry.register(TestModel, testMeta);
            expect(testReg.getForms('TestModel')).to.deep.equal({});
        });

    });

    describe('getForm()', () => {

        it('should return requested form meta', () => {
            modelRegistry.register(TestModel, testMeta);
            testReg.register(TestModel, 'default', formMeta);
            expect(testReg.getForm('TestModel', 'default')).to.equal(formMeta);
        });

        it('should throw an error if the model does not have any forms', () => {
            modelRegistry.register(TestModel, testMeta);
            expect(() => {
                testReg.getForm('TestModel', 'default');
            }).to.throw(`Form 'default' is not defined for model 'TestModel'`);
        });

        it('should throw an error if the requested form does not exist', () => {
            modelRegistry.register(TestModel, testMeta);
            testReg.register(TestModel, 'default', formMeta);
            expect(() => {
                testReg.getForm('TestModel', 'create_form');
            }).to.throw(`Form 'create_form' is not defined for model 'TestModel'`);
        });

    });

});
