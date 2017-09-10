import { ModelValidationResult } from '../../validation/validationresult';
import { IFieldOptions, Field, DEFAULT_FIELD_OPTIONS } from '../field';
import { NumberField, IntegerField, AutoNumberField } from '../numberfields';
import { numberValidator, requiredValidator, minValueValidator, maxValueValidator, integerValidator } from '../../validation/validators';
import { IModelOperation } from '../../operations/operation';

import { expect } from 'chai';
import { Model } from '../../models/model';
import { ModelManager } from '../../registry/registry';

class TestModel extends Model {
    value: any;
}

let manager = new ModelManager();

describe('rev.fields.numberfields', () => {
    let testOp: IModelOperation = {
        operation: 'create'
    };
    let testModel: TestModel;
    let result: ModelValidationResult;

    beforeEach(() => {
        testModel = new TestModel({
            value: null as any
        });
        result = new ModelValidationResult();
    });

    describe('NumberField', () => {

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new NumberField('value', opts);
            expect(test.name).to.equal('value');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
            expect(test).is.instanceof(Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new NumberField('value');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
        });

        it('adds the numberValidator by default', () => {
            let test = new NumberField('value', { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(numberValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new NumberField('value', { required: true });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(numberValidator);
        });

        it('adds the minValue validator if options.minValue is set', () => {
            let test = new NumberField('value', { required: false, minValue: 'a' });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(minValueValidator);
        });

        it('adds the maxValue validator if options.maxValue is set', () => {
            let test = new NumberField('value', { required: false, maxValue: 'z' });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(maxValueValidator);
        });

        it('successfully validates a number value', () => {
            let test = new NumberField('value', { required: true });
            testModel.value = 42.5;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates a number value in a string', () => {
            let test = new NumberField('value', { required: true });
            testModel.value = '12.345';
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates a numeric value that passes validation', () => {
            let test = new NumberField('value', {
                required: true,
                minValue: 40,
                maxValue: 50
            });
            testModel.value = 42.123;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates a null value if field not required', () => {
            let test = new NumberField('value', { required: false });
            testModel.value = null;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('does not validate on null value if field is required', () => {
            let test = new NumberField('value', { required: true });
            testModel.value = null;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate on non-numeric value', () => {
            let test = new NumberField('value', { required: true });
            testModel.value = 'I am a number, honest guv!...';
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate a number if it does not match rules', () => {
            let test = new NumberField('value', {
                required: true,
                minValue: 40.1,
                maxValue: 50.2
            });
            testModel.value = 22.72;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

    });

    describe('IntegerField', () => {

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new IntegerField('value', opts);
            expect(test.name).to.equal('value');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
            expect(test).is.instanceof(NumberField);
        });

        it('sets default field options if they are not specified', () => {
            let test = new IntegerField('value');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
        });

        it('adds the integerValidator by default', () => {
            let test = new IntegerField('value', { required: false });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(numberValidator);
            expect(test.validators[1]).to.equal(integerValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new IntegerField('value', { required: true });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(numberValidator);
            expect(test.validators[2]).to.equal(integerValidator);
        });

        it('adds the minValue validator if options.minValue is set', () => {
            let test = new IntegerField('value', { required: false, minValue: 'a' });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[2]).to.equal(minValueValidator);
        });

        it('adds the maxValue validator if options.maxValue is set', () => {
            let test = new IntegerField('value', { required: false, maxValue: 'z' });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[2]).to.equal(maxValueValidator);
        });

        it('successfully validates an integer value', () => {
            let test = new IntegerField('value', { required: true });
            testModel.value = 42;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates an integer value in a string', () => {
            let test = new IntegerField('value', { required: true });
            testModel.value = '12';
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates an integer value that passes validation', () => {
            let test = new IntegerField('value', {
                required: true,
                minValue: 40,
                maxValue: 50
            });
            testModel.value = 42;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates a null value if field not required', () => {
            let test = new IntegerField('value', { required: false });
            testModel.value = null;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('does not validate on null value if field is required', () => {
            let test = new IntegerField('value', { required: true });
            testModel.value = null;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate on non-integer value', () => {
            let test = new IntegerField('value', { required: true });
            testModel.value = 42.5;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate an integer if it does not match rules', () => {
            let test = new IntegerField('value', {
                required: true,
                minValue: 40,
                maxValue: 50
            });
            testModel.value = 22;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

    });

    describe('AutoNumberField', () => {
        let defaultOpts = Object.assign({}, DEFAULT_FIELD_OPTIONS, { required: false});

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new AutoNumberField('value', opts);
            expect(test.name).to.equal('value');
            expect(test.options).to.deep.equal(defaultOpts);
            expect(test).is.instanceof(Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new AutoNumberField('value');
            expect(test.options).to.deep.equal(defaultOpts);
        });

        it('adds the integerValidator by default', () => {
            let test = new AutoNumberField('value', { required: false });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(numberValidator);
            expect(test.validators[1]).to.equal(integerValidator);
        });

        it('does NOT add the required validator if options.required is true', () => {
            let test = new AutoNumberField('value', { required: true });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(numberValidator);
            expect(test.validators[1]).to.equal(integerValidator);
        });

        it('successfully validates an integer value', () => {
            let test = new AutoNumberField('value');
            testModel.value = 42;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates an integer value in a string', () => {
            let test = new AutoNumberField('value');
            testModel.value = '12';
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates a null value', () => {
            let test = new AutoNumberField('value', { required: false });
            testModel.value = null;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('does not validate on non-integer value', () => {
            let test = new AutoNumberField('value');
            testModel.value = 42.5;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

    });

});
