import { RecordField, IRecordFieldOptions } from '../recordfields';
import { ModelValidationResult } from '../../validation/validationresult';
import { Field, DEFAULT_FIELD_OPTIONS } from '../field';
import { requiredValidator, recordClassValidator } from '../../validation/validators';
import { IModelOperation } from '../../operations/operation';

import { expect } from 'chai';
import { ModelManager } from '../../models/manager';

class TestModel {
    value: any;
}

class TestRelatedModel {
    name: string;
}

class TestUnrelatedModel {}

let manager = new ModelManager();

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
            model: TestRelatedModel
        };

        it('creates a field with properties as expected', () => {
            let test = new RecordField('value', testOpts);
            expect(test.name).to.equal('value');
            expect(test.options).to.deep.equal(
                Object.assign({}, DEFAULT_FIELD_OPTIONS, testOpts));
            expect(test).is.instanceof(Field);
        });

        it('throws if passed model is not a class constructor', () => {
            expect(() => {
                new RecordField('value', {
                    model: 'not_a_class' as any
                });
            }).to.throw('Supplied model is not a model constructor');
        });

        it('adds the just the recordClassValidator if options.required is false', () => {
            let test = new RecordField('value', {model: TestRelatedModel, required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(recordClassValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new RecordField('value', {model: TestRelatedModel, required: true });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(recordClassValidator);
        });

        it('successfully validates a record', () => {
            let test = new RecordField('value', {model: TestRelatedModel});
            let model = new TestRelatedModel();
            model.name = 'fred';
            testModel.value = model;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates a null value if field not required', () => {
            let test = new RecordField('value', {model: TestRelatedModel, required: false });
            testModel.value = null;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('does not validate on null value if field is required', () => {
            let test = new RecordField('value', {model: TestRelatedModel, required: true });
            testModel.value = null;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate a record of the wrong class', () => {
            let test = new RecordField('value', {model: TestRelatedModel});
            testModel.value = new TestUnrelatedModel();
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate an array of models', () => {
            let test = new RecordField('value', {model: TestRelatedModel});
            testModel.value = [new TestRelatedModel()];
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

    });

});
