import { RecordField, RecordListField, IRecordFieldOptions, DEFAULT_RECORDLIST_FIELD_OPTIONS } from '../recordfields';
import { ModelValidationResult } from '../../validation/validationresult';
import { Field, DEFAULT_FIELD_OPTIONS } from '../field';
import { requiredValidator, recordClassValidator, recordListClassValidator, recordPrimaryKeyValidator } from '../../validation/validators';
import { IModelOperation } from '../../operations/operation';

import { expect } from 'chai';
import { ModelManager } from '../../models/manager';
import { InMemoryBackend } from '../../backends/inmemory/backend';
import * as d from '../../decorators';

class TestModel {
    @d.TextField()
        value: any;
}

class TestRelatedModel {
    @d.TextField({ primaryKey: true })
        name: string;
}

class TestUnrelatedModel {}

let manager = new ModelManager();
manager.registerBackend('default', new InMemoryBackend());
manager.register(TestModel);
manager.register(TestRelatedModel);

describe('rev.fields.recordfields', () => {
    let testOp: IModelOperation = {
        operation: 'create'
    };
    let testModel: TestModel;
    let result: ModelValidationResult;

    beforeEach(() => {
        testModel = new TestModel();
        testModel.value = null;
        result = new ModelValidationResult();
    });

    describe('RecordField', () => {
        const testOpts: IRecordFieldOptions = {
            model: 'TestRelatedModel'
        };

        it('creates a field with properties as expected', () => {
            let test = new RecordField('value', testOpts);
            expect(test.name).to.equal('value');
            expect(test.options).to.deep.equal(
                Object.assign({}, DEFAULT_FIELD_OPTIONS, testOpts));
            expect(test).is.instanceof(Field);
        });

        it('throws if passed model is not a string', () => {
            expect(() => {
                new RecordField('value', {
                    model: 22 as any
                });
            }).to.throw('options.model must be a non-empty string');
        });

        it('throws if passed model is an empty string', () => {
            expect(() => {
                new RecordField('value', {
                    model: ''
                });
            }).to.throw('options.model must be a non-empty string');
        });

        it('adds the just the record validators if options.required is false', () => {
            let test = new RecordField('value', {model: 'TestRelatedModel', required: false });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(recordClassValidator);
            expect(test.validators[1]).to.equal(recordPrimaryKeyValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new RecordField('value', {model: 'TestRelatedModel', required: true });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(recordClassValidator);
            expect(test.validators[2]).to.equal(recordPrimaryKeyValidator);
        });

        it('successfully validates a record', () => {
            let test = new RecordField('value', {model: 'TestRelatedModel'});
            let model = new TestRelatedModel();
            model.name = 'fred';
            testModel.value = model;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates a null value if field not required', () => {
            let test = new RecordField('value', {model: 'TestRelatedModel', required: false });
            testModel.value = null;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('does not validate on null value if field is required', () => {
            let test = new RecordField('value', {model: 'TestRelatedModel', required: true });
            testModel.value = null;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate a record of the wrong class', () => {
            let test = new RecordField('value', {model: 'TestRelatedModel'});
            testModel.value = new TestUnrelatedModel();
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate an array of models', () => {
            let test = new RecordField('value', {model: 'TestRelatedModel'});
            testModel.value = [new TestRelatedModel()];
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

    });

    describe('RecordListField', () => {
        const testOpts: IRecordFieldOptions = {
            model: 'TestRelatedModel'
        };

        it('creates a field with properties as expected', () => {
            let test = new RecordListField('value', testOpts);
            let expectedOptions = Object.assign(
                {}, DEFAULT_FIELD_OPTIONS, DEFAULT_RECORDLIST_FIELD_OPTIONS, testOpts);

            expect(test.name).to.equal('value');
            expect(test.options).to.deep.equal(expectedOptions);
            expect(test).is.instanceof(Field);
        });

        it('does not add the required validator by default', () => {
            let test = new RecordListField('value', testOpts);
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(recordListClassValidator);
        });

        it('throws if passed model is not a string', () => {
            expect(() => {
                new RecordListField('value', {
                    model: 22 as any
                });
            }).to.throw('options.model must be a non-empty string');
        });

        it('throws if passed model is an empty string', () => {
            expect(() => {
                new RecordListField('value', {
                    model: ''
                });
            }).to.throw('options.model must be a non-empty string');
        });

        it('adds the just the recordListClassValidator if options.required is false', () => {
            let test = new RecordListField('value', {model: 'TestRelatedModel', required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(recordListClassValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new RecordListField('value', {model: 'TestRelatedModel', required: true });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(recordListClassValidator);
        });

        it('successfully validates a record', () => {
            let test = new RecordListField('value', {model: 'TestRelatedModel'});
            let model1 = new TestRelatedModel();
            let model2 = new TestRelatedModel();
            model1.name = 'Fred';
            model2.name = 'Bob';
            testModel.value = [model1, model2];
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates an undefined value if field not required', () => {
            let test = new RecordListField('value', {model: 'TestRelatedModel', required: false });
            testModel.value = undefined;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('does not validate an undefined value if field is required', () => {
            let test = new RecordListField('value', {model: 'TestRelatedModel', required: true });
            testModel.value = undefined;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate a record of the wrong class', () => {
            let test = new RecordListField('value', {model: 'TestRelatedModel'});
            testModel.value = [new TestUnrelatedModel()];
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate a plain instance of a model', () => {
            let test = new RecordListField('value', {model: 'TestRelatedModel'});
            testModel.value = new TestRelatedModel();
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

    });

});
