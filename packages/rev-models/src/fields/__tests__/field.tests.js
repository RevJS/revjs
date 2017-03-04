"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var field_1 = require("../field");
var validators_1 = require("../validators");
var validation_1 = require("../../models/validation");
function quickValidAsyncValidator(model, field, meta, operation, result) {
    return new Promise(function (resolve, reject) {
        resolve();
    });
}
function quickInvalidAsyncValidator(model, field, meta, operation, result) {
    return new Promise(function (resolve, reject) {
        result.addFieldError('name', 'name field is invalid');
        resolve();
    });
}
function slowInvalidAsyncValidator(model, field, meta, operation, result) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            result.addFieldError('name', 'name field is invalid');
            resolve();
        }, 8000);
    });
}
describe('rev.fields.field', function () {
    describe('Field - constructor()', function () {
        it('creates a field with properties as expected', function () {
            var opts = {
                required: true
            };
            var test = new field_1.Field('name', 'Name', opts);
            chai_1.expect(test.name).to.equal('name');
            chai_1.expect(test.label).to.equal('Name');
            chai_1.expect(test.options).to.equal(opts);
        });
        it('cannot be created without a name', function () {
            chai_1.expect(function () {
                new field_1.Field(undefined, undefined);
            }).to.throw('new fields must have a name');
        });
        it('cannot be created without a label', function () {
            chai_1.expect(function () {
                new field_1.Field('name', undefined);
            }).to.throw('new fields must have a label');
        });
        it('sets default field options if they are not specified', function () {
            var test = new field_1.Field('name', 'Name');
            chai_1.expect(test.options).to.deep.equal(field_1.DEFAULT_FIELD_OPTIONS);
        });
        it('throws an error if options is not an object', function () {
            chai_1.expect(function () {
                new field_1.Field('name', 'Name', function () { return '33'; });
            }).to.throw('the options parameter must be an object');
        });
        it('adds the "required" validator if options.required is true', function () {
            var test = new field_1.Field('name', 'Name', { required: true });
            chai_1.expect(test.validators[0]).to.equal(validators_1.requiredValidator);
        });
        it('adds the "required" validator if options.required is not specified', function () {
            var test = new field_1.Field('name', 'Name', {});
            chai_1.expect(test.validators[0]).to.equal(validators_1.requiredValidator);
        });
        it('does not add any validators if options.required is false', function () {
            var test = new field_1.Field('name', 'Name', { required: false });
            chai_1.expect(test.validators.length).to.equal(0);
        });
    });
    describe('Field - validate()', function () {
        var testModel = {
            name: null
        };
        var testMeta = {
            fields: [new field_1.Field('name', 'Name')]
        };
        var result;
        beforeEach(function () {
            result = new validation_1.ModelValidationResult();
        });
        it('returns a resolved promise when validation completes - no validators', function () {
            var test = new field_1.Field('name', 'Name', { required: false });
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result)).to.eventually.have.property('valid', true);
        });
        it('returns a resolved promise when validation completes - required validator', function () {
            var test = new field_1.Field('name', 'Name', { required: true });
            testModel.name = 'Frank';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result)).to.eventually.have.property('valid', true);
        });
        it('validation fails as expected when required field not set', function () {
            var test = new field_1.Field('name', 'Name', { required: true });
            return chai_1.expect(test.validate({ name: null }, testMeta, { type: 'create' }, result)).to.eventually.have.property('valid', false);
        });
        it('throws an error if a model instance is not passed', function () {
            var test = new field_1.Field('name', 'Name');
            chai_1.expect(function () {
                test.validate('test', testMeta, { type: 'create' }, result);
            }).to.throw('not a model instance');
        });
        it('returns valid = true when validation completes with a valid async validator', function () {
            var test = new field_1.Field('name', 'Name', { required: false });
            test.asyncValidators.push(quickValidAsyncValidator);
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result)).to.eventually.have.property('valid', true);
        });
        it('returns valid = false when validation completes with an invalid async validator', function () {
            var test = new field_1.Field('name', 'Name', { required: false });
            test.asyncValidators.push(quickInvalidAsyncValidator);
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result)).to.eventually.have.property('valid', false);
        });
        it('returns valid = false when validation completes with a valid and an invalid async validator', function () {
            var test = new field_1.Field('name', 'Name', { required: false });
            test.asyncValidators.push(quickValidAsyncValidator);
            test.asyncValidators.push(quickInvalidAsyncValidator);
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result)).to.eventually.have.property('valid', false);
        });
        it('returns a rejected promise when async validation times out', function () {
            var test = new field_1.Field('name', 'Name', { required: false });
            test.asyncValidators.push(slowInvalidAsyncValidator);
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result, {
                timeout: 100
            })).to.be.rejectedWith('timed out');
        });
    });
});
