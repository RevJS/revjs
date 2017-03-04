"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var datetimefields_1 = require("../datetimefields");
var validation_1 = require("../../models/validation");
var field_1 = require("../field");
var validators_1 = require("../validators");
var chai_1 = require("chai");
describe('rev.fields.datetimefields', function () {
    describe('DateField', function () {
        var testModel = {
            value: null
        };
        var testMeta = {
            fields: [new datetimefields_1.DateField('value', 'Value')]
        };
        var result;
        beforeEach(function () {
            result = new validation_1.ModelValidationResult();
        });
        it('creates a field with properties as expected', function () {
            var opts = {};
            var test = new datetimefields_1.DateField('value', 'Value', opts);
            chai_1.expect(test.name).to.equal('value');
            chai_1.expect(test.label).to.equal('Value');
            chai_1.expect(test.options).to.equal(opts);
            chai_1.expect(test).is.instanceof(field_1.Field);
        });
        it('sets default field options if they are not specified', function () {
            var test = new datetimefields_1.DateField('value', 'Value');
            chai_1.expect(test.options).to.deep.equal(field_1.DEFAULT_FIELD_OPTIONS);
        });
        it('adds the dateOnlyValidator by default', function () {
            var test = new datetimefields_1.DateField('value', 'Value', { required: false });
            chai_1.expect(test.validators.length).to.equal(1);
            chai_1.expect(test.validators[0]).to.equal(validators_1.dateOnlyValidator);
        });
        it('adds the required validator if options.required is true', function () {
            var test = new datetimefields_1.DateField('value', 'Value', { required: true });
            chai_1.expect(test.validators.length).to.equal(2);
            chai_1.expect(test.validators[0]).to.equal(validators_1.requiredValidator);
            chai_1.expect(test.validators[1]).to.equal(validators_1.dateOnlyValidator);
        });
        it('successfully validates a date value', function () {
            var test = new datetimefields_1.DateField('value', 'Value', { required: true });
            testModel.value = new Date(2016, 12, 23);
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates a date value in a string', function () {
            var test = new datetimefields_1.DateField('value', 'Value', { required: true });
            testModel.value = '2016-12-23';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates a null value if field not required', function () {
            var test = new datetimefields_1.DateField('value', 'Value', { required: false });
            testModel.value = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('does not validate on null value if field is required', function () {
            var test = new datetimefields_1.DateField('value', 'Value', { required: true });
            testModel.value = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
        it('does not validate a non-date value', function () {
            var test = new datetimefields_1.DateField('value', 'Value', { required: true });
            testModel.value = 'I am a date, honest guv!...';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
    });
    describe('TimeField', function () {
        var testModel = {
            value: null
        };
        var testMeta = {
            fields: [new datetimefields_1.TimeField('value', 'Value')]
        };
        var result;
        beforeEach(function () {
            result = new validation_1.ModelValidationResult();
        });
        it('creates a field with properties as expected', function () {
            var opts = {};
            var test = new datetimefields_1.TimeField('value', 'Value', opts);
            chai_1.expect(test.name).to.equal('value');
            chai_1.expect(test.label).to.equal('Value');
            chai_1.expect(test.options).to.equal(opts);
            chai_1.expect(test).is.instanceof(field_1.Field);
        });
        it('sets default field options if they are not specified', function () {
            var test = new datetimefields_1.TimeField('value', 'Value');
            chai_1.expect(test.options).to.deep.equal(field_1.DEFAULT_FIELD_OPTIONS);
        });
        it('adds the timeOnlyValidator by default', function () {
            var test = new datetimefields_1.TimeField('value', 'Value', { required: false });
            chai_1.expect(test.validators.length).to.equal(1);
            chai_1.expect(test.validators[0]).to.equal(validators_1.timeOnlyValidator);
        });
        it('adds the required validator if options.required is true', function () {
            var test = new datetimefields_1.TimeField('value', 'Value', { required: true });
            chai_1.expect(test.validators.length).to.equal(2);
            chai_1.expect(test.validators[0]).to.equal(validators_1.requiredValidator);
            chai_1.expect(test.validators[1]).to.equal(validators_1.timeOnlyValidator);
        });
        it('successfully validates a date object value', function () {
            var test = new datetimefields_1.TimeField('value', 'Value', { required: true });
            testModel.value = new Date(2016, 12, 23, 15, 27, 32);
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates a time value in a string', function () {
            var test = new datetimefields_1.TimeField('value', 'Value', { required: true });
            testModel.value = '15:27:32';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates a null value if field not required', function () {
            var test = new datetimefields_1.TimeField('value', 'Value', { required: false });
            testModel.value = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('does not validate on null value if field is required', function () {
            var test = new datetimefields_1.TimeField('value', 'Value', { required: true });
            testModel.value = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
        it('does not validate a non-time value', function () {
            var test = new datetimefields_1.TimeField('value', 'Value', { required: true });
            testModel.value = 'Time you got a watch!...';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
    });
    describe('DateTimeField', function () {
        var testModel = {
            value: null
        };
        var testMeta = {
            fields: [new datetimefields_1.DateTimeField('value', 'Value')]
        };
        var result;
        beforeEach(function () {
            result = new validation_1.ModelValidationResult();
        });
        it('creates a field with properties as expected', function () {
            var opts = {};
            var test = new datetimefields_1.DateTimeField('value', 'Value', opts);
            chai_1.expect(test.name).to.equal('value');
            chai_1.expect(test.label).to.equal('Value');
            chai_1.expect(test.options).to.equal(opts);
            chai_1.expect(test).is.instanceof(field_1.Field);
        });
        it('sets default field options if they are not specified', function () {
            var test = new datetimefields_1.DateTimeField('value', 'Value');
            chai_1.expect(test.options).to.deep.equal(field_1.DEFAULT_FIELD_OPTIONS);
        });
        it('adds the dateTimeValidator by default', function () {
            var test = new datetimefields_1.DateTimeField('value', 'Value', { required: false });
            chai_1.expect(test.validators.length).to.equal(1);
            chai_1.expect(test.validators[0]).to.equal(validators_1.dateTimeValidator);
        });
        it('adds the required validator if options.required is true', function () {
            var test = new datetimefields_1.DateTimeField('value', 'Value', { required: true });
            chai_1.expect(test.validators.length).to.equal(2);
            chai_1.expect(test.validators[0]).to.equal(validators_1.requiredValidator);
            chai_1.expect(test.validators[1]).to.equal(validators_1.dateTimeValidator);
        });
        it('successfully validates a date and time value', function () {
            var test = new datetimefields_1.DateTimeField('value', 'Value', { required: true });
            testModel.value = new Date(2016, 12, 23, 11, 22, 33);
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates a date time value in a string', function () {
            var test = new datetimefields_1.DateTimeField('value', 'Value', { required: true });
            testModel.value = '2016-12-23T21:32:43';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates a null value if field not required', function () {
            var test = new datetimefields_1.DateTimeField('value', 'Value', { required: false });
            testModel.value = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('does not validate on null value if field is required', function () {
            var test = new datetimefields_1.DateTimeField('value', 'Value', { required: true });
            testModel.value = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
        it('does not validate a non-datetime value', function () {
            var test = new datetimefields_1.DateTimeField('value', 'Value', { required: true });
            testModel.value = 'I am a non-datetime value';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
    });
});
