"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var validation_1 = require("../../models/validation");
var field_1 = require("../field");
var numberfields_1 = require("../numberfields");
var validators_1 = require("../validators");
var chai_1 = require("chai");
describe('rev.fields.numberfields', function () {
    describe('NumberField', function () {
        var testModel = {
            value: null
        };
        var testMeta = {
            fields: [new numberfields_1.NumberField('value', 'Value')]
        };
        var result;
        beforeEach(function () {
            result = new validation_1.ModelValidationResult();
        });
        it('creates a field with properties as expected', function () {
            var opts = {};
            var test = new numberfields_1.NumberField('value', 'Value', opts);
            chai_1.expect(test.name).to.equal('value');
            chai_1.expect(test.label).to.equal('Value');
            chai_1.expect(test.options).to.equal(opts);
            chai_1.expect(test).is.instanceof(field_1.Field);
        });
        it('sets default field options if they are not specified', function () {
            var test = new numberfields_1.NumberField('value', 'Value');
            chai_1.expect(test.options).to.deep.equal(field_1.DEFAULT_FIELD_OPTIONS);
        });
        it('adds the numberValidator by default', function () {
            var test = new numberfields_1.NumberField('value', 'Value', { required: false });
            chai_1.expect(test.validators.length).to.equal(1);
            chai_1.expect(test.validators[0]).to.equal(validators_1.numberValidator);
        });
        it('adds the required validator if options.required is true', function () {
            var test = new numberfields_1.NumberField('value', 'Value', { required: true });
            chai_1.expect(test.validators.length).to.equal(2);
            chai_1.expect(test.validators[0]).to.equal(validators_1.requiredValidator);
            chai_1.expect(test.validators[1]).to.equal(validators_1.numberValidator);
        });
        it('adds the minValue validator if options.minValue is set', function () {
            var test = new numberfields_1.NumberField('value', 'Value', { required: false, minValue: 'a' });
            chai_1.expect(test.validators.length).to.equal(2);
            chai_1.expect(test.validators[1]).to.equal(validators_1.minValueValidator);
        });
        it('adds the maxValue validator if options.maxValue is set', function () {
            var test = new numberfields_1.NumberField('value', 'Value', { required: false, maxValue: 'z' });
            chai_1.expect(test.validators.length).to.equal(2);
            chai_1.expect(test.validators[1]).to.equal(validators_1.maxValueValidator);
        });
        it('successfully validates a number value', function () {
            var test = new numberfields_1.NumberField('value', 'Value', { required: true });
            testModel.value = 42.5;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates a number value in a string', function () {
            var test = new numberfields_1.NumberField('value', 'Value', { required: true });
            testModel.value = '12.345';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates a numeric value that passes validation', function () {
            var test = new numberfields_1.NumberField('value', 'Value', {
                required: true,
                minValue: 40,
                maxValue: 50
            });
            testModel.value = 42.123;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates a null value if field not required', function () {
            var test = new numberfields_1.NumberField('value', 'Value', { required: false });
            testModel.value = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('does not validate on null value if field is required', function () {
            var test = new numberfields_1.NumberField('value', 'Value', { required: true });
            testModel.value = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
        it('does not validate on non-numeric value', function () {
            var test = new numberfields_1.NumberField('value', 'Value', { required: true });
            testModel.value = 'I am a number, honest guv!...';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
        it('does not validate a number if it does not match rules', function () {
            var test = new numberfields_1.NumberField('value', 'Value', {
                required: true,
                minValue: 40.1,
                maxValue: 50.2
            });
            testModel.value = 22.72;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
    });
    describe('IntegerField', function () {
        var testModel = {
            value: null
        };
        var testMeta = {
            fields: [new numberfields_1.IntegerField('value', 'Value')]
        };
        var result;
        beforeEach(function () {
            result = new validation_1.ModelValidationResult();
        });
        it('creates a field with properties as expected', function () {
            var opts = {};
            var test = new numberfields_1.IntegerField('value', 'Value', opts);
            chai_1.expect(test.name).to.equal('value');
            chai_1.expect(test.label).to.equal('Value');
            chai_1.expect(test.options).to.equal(opts);
            chai_1.expect(test).is.instanceof(numberfields_1.NumberField);
        });
        it('sets default field options if they are not specified', function () {
            var test = new numberfields_1.IntegerField('value', 'Value');
            chai_1.expect(test.options).to.deep.equal(field_1.DEFAULT_FIELD_OPTIONS);
        });
        it('adds the integerValidator by default', function () {
            var test = new numberfields_1.IntegerField('value', 'Value', { required: false });
            chai_1.expect(test.validators.length).to.equal(2);
            chai_1.expect(test.validators[0]).to.equal(validators_1.numberValidator);
            chai_1.expect(test.validators[1]).to.equal(validators_1.integerValidator);
        });
        it('adds the required validator if options.required is true', function () {
            var test = new numberfields_1.IntegerField('value', 'Value', { required: true });
            chai_1.expect(test.validators.length).to.equal(3);
            chai_1.expect(test.validators[0]).to.equal(validators_1.requiredValidator);
            chai_1.expect(test.validators[1]).to.equal(validators_1.numberValidator);
            chai_1.expect(test.validators[2]).to.equal(validators_1.integerValidator);
        });
        it('adds the minValue validator if options.minValue is set', function () {
            var test = new numberfields_1.IntegerField('value', 'Value', { required: false, minValue: 'a' });
            chai_1.expect(test.validators.length).to.equal(3);
            chai_1.expect(test.validators[2]).to.equal(validators_1.minValueValidator);
        });
        it('adds the maxValue validator if options.maxValue is set', function () {
            var test = new numberfields_1.IntegerField('value', 'Value', { required: false, maxValue: 'z' });
            chai_1.expect(test.validators.length).to.equal(3);
            chai_1.expect(test.validators[2]).to.equal(validators_1.maxValueValidator);
        });
        it('successfully validates an integer value', function () {
            var test = new numberfields_1.IntegerField('value', 'Value', { required: true });
            testModel.value = 42;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates an integer value in a string', function () {
            var test = new numberfields_1.IntegerField('value', 'Value', { required: true });
            testModel.value = '12';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates an integer value that passes validation', function () {
            var test = new numberfields_1.IntegerField('value', 'Value', {
                required: true,
                minValue: 40,
                maxValue: 50
            });
            testModel.value = 42;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates a null value if field not required', function () {
            var test = new numberfields_1.IntegerField('value', 'Value', { required: false });
            testModel.value = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('does not validate on null value if field is required', function () {
            var test = new numberfields_1.IntegerField('value', 'Value', { required: true });
            testModel.value = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
        it('does not validate on non-integer value', function () {
            var test = new numberfields_1.IntegerField('value', 'Value', { required: true });
            testModel.value = 42.5;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
        it('does not validate an integer if it does not match rules', function () {
            var test = new numberfields_1.IntegerField('value', 'Value', {
                required: true,
                minValue: 40,
                maxValue: 50
            });
            testModel.value = 22;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
    });
});
