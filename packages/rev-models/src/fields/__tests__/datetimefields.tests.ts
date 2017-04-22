import { DateField, TimeField, DateTimeField } from '../datetimefields';
import { ModelValidationResult } from '../../validation/validationresult';
import { IFieldOptions, Field, DEFAULT_FIELD_OPTIONS } from '../field';
import { dateOnlyValidator, requiredValidator, timeOnlyValidator, dateTimeValidator } from '../../validation/validators';

import { expect } from 'chai';
import { IModelOperation } from '../../operations/operation';
import { Model } from '../../models/model';
import { ModelRegistry } from '../../registry/registry';

class TestModel extends Model {
    value: any;
}

let registry = new ModelRegistry();

describe('rev.fields.datetimefields', () => {
    let testModel: TestModel;
    let testOp: IModelOperation = {
        operation: 'create'
    };
    let result: ModelValidationResult;

    beforeEach(() => {
        testModel = new TestModel({
            value: null
        });
        result = new ModelValidationResult();
    });

    describe('DateField', () => {

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new DateField('value', opts);
            expect(test.name).to.equal('value');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
            expect(test).is.instanceof(Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new DateField('value');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
        });

        it('adds the dateOnlyValidator by default', () => {
            let test = new DateField('value', { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(dateOnlyValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new DateField('value', { required: true });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(dateOnlyValidator);
        });

        it('successfully validates a date value', () => {
            let test = new DateField('value', { required: true });
            testModel.value = new Date(2016, 12, 23);
            return expect(test.validate(registry, testModel, testOp, result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a date value in a string', () => {
            let test = new DateField('value', { required: true });
            testModel.value = '2016-12-23';
            return expect(test.validate(registry, testModel, testOp, result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new DateField('value', { required: false });
            testModel.value = null;
            return expect(test.validate(registry, testModel, testOp, result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new DateField('value', { required: true });
            testModel.value = null;
            return expect(test.validate(registry, testModel, testOp, result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate a non-date value', () => {
            let test = new DateField('value', { required: true });
            testModel.value = 'I am a date, honest guv!...';
            return expect(test.validate(registry, testModel, testOp, result))
                .to.eventually.have.property('valid', false);
        });

    });

    describe('TimeField', () => {

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new TimeField('value', opts);
            expect(test.name).to.equal('value');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
            expect(test).is.instanceof(Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new TimeField('value');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
        });

        it('adds the timeOnlyValidator by default', () => {
            let test = new TimeField('value', { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(timeOnlyValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new TimeField('value', { required: true });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(timeOnlyValidator);
        });

        it('successfully validates a date object value', () => {
            let test = new TimeField('value', { required: true });
            testModel.value = new Date(2016, 12, 23, 15, 27, 32);
            return expect(test.validate(registry, testModel, testOp, result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a time value in a string', () => {
            let test = new TimeField('value', { required: true });
            testModel.value = '15:27:32';
            return expect(test.validate(registry, testModel, testOp, result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new TimeField('value', { required: false });
            testModel.value = null;
            return expect(test.validate(registry, testModel, testOp, result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new TimeField('value', { required: true });
            testModel.value = null;
            return expect(test.validate(registry, testModel, testOp, result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate a non-time value', () => {
            let test = new TimeField('value', { required: true });
            testModel.value = 'Time you got a watch!...';
            return expect(test.validate(registry, testModel, testOp, result))
                .to.eventually.have.property('valid', false);
        });

    });

    describe('DateTimeField', () => {

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new DateTimeField('value', opts);
            expect(test.name).to.equal('value');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
            expect(test).is.instanceof(Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new DateTimeField('value');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
        });

        it('adds the dateTimeValidator by default', () => {
            let test = new DateTimeField('value', { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(dateTimeValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new DateTimeField('value', { required: true });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(dateTimeValidator);
        });

        it('successfully validates a date and time value', () => {
            let test = new DateTimeField('value', { required: true });
            testModel.value = new Date(2016, 12, 23, 11, 22, 33);
            return expect(test.validate(registry, testModel, testOp, result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a date time value in a string', () => {
            let test = new DateTimeField('value', { required: true });
            testModel.value = '2016-12-23T21:32:43';
            return expect(test.validate(registry, testModel, testOp, result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new DateTimeField('value', { required: false });
            testModel.value = null;
            return expect(test.validate(registry, testModel, testOp, result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new DateTimeField('value', { required: true });
            testModel.value = null;
            return expect(test.validate(registry, testModel, testOp, result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate a non-datetime value', () => {
            let test = new DateTimeField('value', { required: true });
            testModel.value = 'I am a non-datetime value';
            return expect(test.validate(registry, testModel, testOp, result))
                .to.eventually.have.property('valid', false);
        });

    });

});
