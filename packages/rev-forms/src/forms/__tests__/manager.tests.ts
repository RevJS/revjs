
import {
    ModelManager, IModelMeta,
    fields as f, InMemoryBackend
} from 'rev-models';
import * as reg from '../manager';

import { IFormMeta } from '../../forms/meta';

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

let formMeta: IFormMeta;
let modelReg: ModelManager;

describe('ModelManager', () => {
    let testReg: reg.ModelFormManager;

    beforeEach(() => {
        modelReg = new ModelManager();
        modelReg.registerBackend('default', new InMemoryBackend());
        testReg = new reg.ModelFormManager(modelReg);
        formMeta = {
            title: 'Test Form',
            fields: [ 'name', 'date' ]
        };
    });

    describe('constructor()', () => {

        it('successfully creates a Manager', () => {
            expect(() => {
                testReg = new reg.ModelFormManager(modelReg);
            }).to.not.throw();
        });

        it('throws if not passed a ModelManager', () => {
            expect(() => {
                testReg = new reg.ModelFormManager(null);
            }).to.throw('Invalid ModelManager passed in constructor');
        });

    });

    describe('isRegistered()', () => {

        it('returns false when a model is not registered', () => {
            expect(testReg.isRegistered('TestModel', 'default')).to.equal(false);
        });

        it('returns true when a model is registered', () => {
            modelReg.register(TestModel, testMeta);
            testReg.register(TestModel, 'default', formMeta);
            expect(testReg.isRegistered('TestModel', 'default')).to.equal(true);
        });

        it('returns false when a non-string is passed for modelName', () => {
            expect(testReg.isRegistered(22 as any, 'default')).to.equal(false);
        });

        it('returns false when a non-string is passed for formName', () => {
            expect(testReg.isRegistered('TestModel', 128 as any)).to.equal(false);
        });

        it('returns false when an object is passed for modelName', () => {
            expect(testReg.isRegistered({test: 1} as any, 'default')).to.equal(false);
        });

        it('returns false when an object is passed for formName', () => {
            expect(testReg.isRegistered('TestModel', {test: 1} as any)).to.equal(false);
        });

    });

    describe('register()', () => {

        it('adds a valid form to the Manager', () => {
            modelReg.register(TestModel, testMeta);
            testReg.register(TestModel, 'default', formMeta);
            expect(testReg.getForm('TestModel', 'default')).to.equal(formMeta);
        });

        it('rejects when model is not defined', () => {
            expect(() => {
                testReg.register(null, 'default', formMeta);
            }).to.throw('Invalid model specified');
        });

        it('throws an error if model has not been registered', () => {
            expect(() => {
                testReg.register(TestModel, 'default', formMeta);
            }).to.throw(`Model 'TestModel' has not been registered`);
        });

        it('throws an error if formName is empty', () => {
            modelReg.register(TestModel, testMeta);
            expect(() => {
                testReg.register(TestModel, '', formMeta);
            }).to.throw(`Invalid formName specified`);
        });

        it('throws an error if formName is not a string', () => {
            modelReg.register(TestModel, testMeta);
            expect(() => {
                testReg.register(TestModel, 22 as any, formMeta);
            }).to.throw(`Invalid formName specified`);
        });

        it('throws an error if specified form is already registered', () => {
            modelReg.register(TestModel, testMeta);
            testReg.register(TestModel, 'default', formMeta);
            expect(() => {
                testReg.register(TestModel, 'default', formMeta);
            }).to.throw(`Form 'default' is already defined for model 'TestModel'`);
        });

        it('throws an error if form metadata is invalid', () => {
            modelReg.register(TestModel, testMeta);
            expect(() => {
                testReg.register(TestModel, 'default', {} as any);
            }).to.throw(`FormMetadataError`);
        });

    });

    describe('getForms()', () => {

        it('returns all registered forms for the specified model', () => {
            modelReg.register(TestModel, testMeta);
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
            modelReg.register(TestModel, testMeta);
            expect(testReg.getForms('TestModel')).to.deep.equal({});
        });

    });

    describe('getForm()', () => {

        it('should return requested form meta', () => {
            modelReg.register(TestModel, testMeta);
            testReg.register(TestModel, 'default', formMeta);
            expect(testReg.getForm('TestModel', 'default')).to.equal(formMeta);
        });

        it('should throw an error if the model does not have any forms', () => {
            modelReg.register(TestModel, testMeta);
            expect(() => {
                testReg.getForm('TestModel', 'default');
            }).to.throw(`Form 'default' is not defined for model 'TestModel'`);
        });

        it('should throw an error if the requested form does not exist', () => {
            modelReg.register(TestModel, testMeta);
            testReg.register(TestModel, 'default', formMeta);
            expect(() => {
                testReg.getForm('TestModel', 'create_form');
            }).to.throw(`Form 'create_form' is not defined for model 'TestModel'`);
        });

    });

});
