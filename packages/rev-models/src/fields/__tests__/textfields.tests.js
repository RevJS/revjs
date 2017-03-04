"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var textfields_1 = require("../textfields");
var validation_1 = require("../../models/validation");
var field_1 = require("../field");
var validators_1 = require("../validators");
var chai_1 = require("chai");
describe('rev.fields.textfields', function () {
    describe('TextField', function () {
        var testModel = {
            name: null
        };
        var testMeta = {
            fields: [new textfields_1.TextField('name', 'Name')]
        };
        var result;
        beforeEach(function () {
            result = new validation_1.ModelValidationResult();
        });
        it('creates a field with properties as expected', function () {
            var opts = {};
            var test = new textfields_1.TextField('name', 'Name', opts);
            chai_1.expect(test.name).to.equal('name');
            chai_1.expect(test.label).to.equal('Name');
            chai_1.expect(test.options).to.equal(opts);
            chai_1.expect(test).is.instanceof(field_1.Field);
        });
        it('sets default field options if they are not specified', function () {
            var test = new textfields_1.TextField('name', 'Name');
            chai_1.expect(test.options).to.deep.equal(field_1.DEFAULT_FIELD_OPTIONS);
        });
        it('adds the stringValidator by default', function () {
            var test = new textfields_1.TextField('name', 'Name', { required: false });
            chai_1.expect(test.validators.length).to.equal(1);
            chai_1.expect(test.validators[0]).to.equal(validators_1.stringValidator);
        });
        it('adds the required and stringEmpty validators if options.required is true', function () {
            var test = new textfields_1.TextField('name', 'Name', { required: true });
            chai_1.expect(test.validators.length).to.equal(3);
            chai_1.expect(test.validators[0]).to.equal(validators_1.requiredValidator);
            chai_1.expect(test.validators[1]).to.equal(validators_1.stringValidator);
            chai_1.expect(test.validators[2]).to.equal(validators_1.stringEmptyValidator);
        });
        it('adds the minLength validator if options.minLength is set', function () {
            var test = new textfields_1.TextField('name', 'Name', { required: false, minLength: 10 });
            chai_1.expect(test.validators.length).to.equal(2);
            chai_1.expect(test.validators[1]).to.equal(validators_1.minStringLengthValidator);
        });
        it('adds the maxLength validator if options.maxLength is set', function () {
            var test = new textfields_1.TextField('name', 'Name', { required: false, maxLength: 10 });
            chai_1.expect(test.validators.length).to.equal(2);
            chai_1.expect(test.validators[1]).to.equal(validators_1.maxStringLengthValidator);
        });
        it('adds the minValue validator if options.minValue is set', function () {
            var test = new textfields_1.TextField('name', 'Name', { required: false, minValue: 'a' });
            chai_1.expect(test.validators.length).to.equal(2);
            chai_1.expect(test.validators[1]).to.equal(validators_1.minValueValidator);
        });
        it('adds the maxValue validator if options.maxValue is set', function () {
            var test = new textfields_1.TextField('name', 'Name', { required: false, maxValue: 'z' });
            chai_1.expect(test.validators.length).to.equal(2);
            chai_1.expect(test.validators[1]).to.equal(validators_1.maxValueValidator);
        });
        it('adds the regEx validator if options.regEx is set to a RegExp', function () {
            var test = new textfields_1.TextField('name', 'Name', { required: false, regEx: /^T/ });
            chai_1.expect(test.validators.length).to.equal(2);
            chai_1.expect(test.validators[1]).to.equal(validators_1.regExValidator);
        });
        it('successfully validates a string value', function () {
            var test = new textfields_1.TextField('name', 'Name', { required: true });
            testModel.name = 'Joe Smith';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates a string value that passes validation', function () {
            var test = new textfields_1.TextField('name', 'Name', {
                required: true,
                minLength: 1,
                maxLength: 10,
                minValue: 'a',
                maxValue: 'z',
                regEx: /^abc/
            });
            testModel.name = 'abc123';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates a null value if field not required', function () {
            var test = new textfields_1.TextField('name', 'Name', { required: false });
            testModel.name = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('does not validate on null value if field is required', function () {
            var test = new textfields_1.TextField('name', 'Name', { required: true });
            testModel.name = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
        it('does not validate on non-string value', function () {
            var test = new textfields_1.TextField('name', 'Name', { required: true });
            testModel.name = true;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
        it('does not validate a string if it does not match rules', function () {
            var test = new textfields_1.TextField('name', 'Name', {
                required: true,
                minLength: 1,
                maxLength: 10,
                minValue: 'a',
                maxValue: 'd'
            });
            testModel.name = 'This string is too long and out of range';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
    });
    describe('EmailField', function () {
        var testModel = {
            email: null
        };
        var testMeta = {
            fields: [new textfields_1.EmailField('email', 'E-mail')]
        };
        var result;
        beforeEach(function () {
            result = new validation_1.ModelValidationResult();
        });
        it('creates a field with properties as expected', function () {
            var opts = {};
            var test = new textfields_1.EmailField('email', 'E-mail', opts);
            chai_1.expect(test).is.instanceof(textfields_1.TextField);
            chai_1.expect(test.name).to.equal('email');
            chai_1.expect(test.label).to.equal('E-mail');
            chai_1.expect(test.options).to.equal(opts);
            chai_1.expect(test.options.regEx).to.equal(textfields_1.EMAIL_ADDR_REGEX);
        });
        it('sets default field options if they are not specified', function () {
            var test = new textfields_1.EmailField('email', 'E-mail');
            chai_1.expect(test.options).to.deep.equal(Object.assign({}, field_1.DEFAULT_FIELD_OPTIONS, {
                regEx: textfields_1.EMAIL_ADDR_REGEX
            }));
        });
        it('allows the default e-mail address regex to be overridden', function () {
            var testRegex = /abc/;
            var test = new textfields_1.EmailField('email', 'E-mail', {
                regEx: testRegex
            });
            chai_1.expect(test.options.regEx).to.equal(testRegex);
        });
        it('uses the default regex if an invalid regex is passed', function () {
            var testRegex = { test: 'flibble' };
            var test = new textfields_1.EmailField('email', 'E-mail', {
                regEx: testRegex
            });
            chai_1.expect(test.options.regEx).to.equal(textfields_1.EMAIL_ADDR_REGEX);
        });
        it('successfully validates a valid e-mail address', function () {
            var test = new textfields_1.EmailField('email', 'E-mail');
            testModel.email = 'Joe.Smith_21@gmail.com';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully picks up an invalid e-mail address', function () {
            var test = new textfields_1.EmailField('email', 'E-mail');
            testModel.email = 'Joe.Smith_not_an_email.com';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
        it('successfully validates a null value if field not required', function () {
            var test = new textfields_1.EmailField('email', 'E-mail', { required: false });
            testModel.email = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
    });
    describe('URLField', function () {
        var testModel = {
            website: null
        };
        var testMeta = {
            fields: [new textfields_1.URLField('website', 'Website')]
        };
        var result;
        beforeEach(function () {
            result = new validation_1.ModelValidationResult();
        });
        it('creates a field with properties as expected', function () {
            var opts = {};
            var test = new textfields_1.URLField('website', 'Website', opts);
            chai_1.expect(test).is.instanceof(textfields_1.TextField);
            chai_1.expect(test.name).to.equal('website');
            chai_1.expect(test.label).to.equal('Website');
            chai_1.expect(test.options).to.equal(opts);
            chai_1.expect(test.options.regEx).to.equal(textfields_1.URL_REGEX);
        });
        it('sets default field options if they are not specified', function () {
            var test = new textfields_1.URLField('website', 'Website');
            chai_1.expect(test.options).to.deep.equal(Object.assign({}, field_1.DEFAULT_FIELD_OPTIONS, {
                regEx: textfields_1.URL_REGEX
            }));
        });
        it('allows the default url regex to be overridden', function () {
            var testRegex = /abc/;
            var test = new textfields_1.URLField('website', 'Website', {
                regEx: testRegex
            });
            chai_1.expect(test.options.regEx).to.equal(testRegex);
        });
        it('uses the default regex if an invalid regex is passed', function () {
            var testRegex = { test: 'flibble' };
            var test = new textfields_1.URLField('website', 'Website', {
                regEx: testRegex
            });
            chai_1.expect(test.options.regEx).to.equal(textfields_1.URL_REGEX);
        });
        it('successfully validates a valid url', function () {
            var test = new textfields_1.URLField('website', 'Website');
            testModel.website = 'www.google.com';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates a valid url with protocol', function () {
            var test = new textfields_1.URLField('website', 'Website');
            testModel.website = 'https://www.google.com';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully picks up an invalid url', function () {
            var test = new textfields_1.URLField('website', 'Website');
            testModel.website = 'not_a_website_url';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
        it('successfully validates a null value if field not required', function () {
            var test = new textfields_1.URLField('website', 'Website', { required: false });
            testModel.website = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
    });
});
