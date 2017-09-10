import { TextField, EmailField, EMAIL_ADDR_REGEX, URLField, URL_REGEX } from '../textfields';
import { ModelValidationResult } from '../../validation/validationresult';
import { IFieldOptions, Field, DEFAULT_FIELD_OPTIONS } from '../field';
import { stringValidator, requiredValidator, stringEmptyValidator, minStringLengthValidator, maxStringLengthValidator, minValueValidator, maxValueValidator, regExValidator } from '../../validation/validators';
import { IModelOperation } from '../../operations/operation';

import { expect } from 'chai';
import { Model } from '../../models/model';
import { ModelManager } from '../../registry/registry';

class TestModel extends Model {
    value: any;
}

let manager = new ModelManager();

describe('rev.fields.textfields', () => {
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

    describe('TextField', () => {

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new TextField('value', opts);
            expect(test.name).to.equal('value');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
            expect(test).is.instanceof(Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new TextField('value');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
        });

        it('adds the stringValidator by default', () => {
            let test = new TextField('value', { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(stringValidator);
        });

        it('adds the required and stringEmpty validators if options.required is true', () => {
            let test = new TextField('value', { required: true });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(stringValidator);
            expect(test.validators[2]).to.equal(stringEmptyValidator);
        });

        it('adds the minLength validator if options.minLength is set', () => {
            let test = new TextField('value', { required: false, minLength: 10 });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(minStringLengthValidator);
        });

        it('adds the maxLength validator if options.maxLength is set', () => {
            let test = new TextField('value', { required: false, maxLength: 10 });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(maxStringLengthValidator);
        });

        it('adds the minValue validator if options.minValue is set', () => {
            let test = new TextField('value', { required: false, minValue: 'a' });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(minValueValidator);
        });

        it('adds the maxValue validator if options.maxValue is set', () => {
            let test = new TextField('value', { required: false, maxValue: 'z' });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(maxValueValidator);
        });

        it('adds the regEx validator if options.regEx is set to a RegExp', () => {
            let test = new TextField('value', { required: false, regEx: /^T/ });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(regExValidator);
        });

        it('successfully validates a string value', () => {
            let test = new TextField('value', { required: true });
            testModel.value = 'Joe Smith';
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates a string value that passes validation', () => {
            let test = new TextField('value', {
                required: true,
                minLength: 1,
                maxLength: 10,
                minValue: 'a',
                maxValue: 'z',
                regEx: /^abc/
            });
            testModel.value = 'abc123';
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates a null value if field not required', () => {
            let test = new TextField('value', { required: false });
            testModel.value = null;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('does not validate on null value if field is required', () => {
            let test = new TextField('value', { required: true });
            testModel.value = null;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate on non-string value', () => {
            let test = new TextField('value', { required: true });
            testModel.value = true;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate a string if it does not match rules', () => {
            let test = new TextField('value', {
                required: true,
                minLength: 1,
                maxLength: 10,
                minValue: 'a',
                maxValue: 'd'
            });
            testModel.value = 'This string is too long and out of range';
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

    });

    describe('EmailField', () => {

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = Object.assign(
                {}, DEFAULT_FIELD_OPTIONS,
                { regEx: EMAIL_ADDR_REGEX }
            );
            let test = new EmailField('value');
            expect(test).is.instanceof(TextField);
            expect(test.name).to.equal('value');
            expect(test.options).to.deep.equal(opts);
            expect(test.options.regEx).to.equal(EMAIL_ADDR_REGEX);
        });

        it('sets default field options if they are not specified', () => {
            let test = new EmailField('value');
            expect(test.options).to.deep.equal(
                Object.assign({}, DEFAULT_FIELD_OPTIONS, {
                    regEx: EMAIL_ADDR_REGEX
                })
            );
        });

        it('allows the default e-mail address regex to be overridden', () => {
            let testRegex = /abc/;
            let test = new EmailField('value', {
                regEx: testRegex
            });
            expect(test.options.regEx).to.equal(testRegex);
        });

        it('uses the default regex if an invalid regex is passed', () => {
            let testRegex = { test: 'flibble' };
            let test = new EmailField('value', {
                regEx: testRegex as any
            });
            expect(test.options.regEx).to.equal(EMAIL_ADDR_REGEX);
        });

        it('successfully validates a valid e-mail address', () => {
            let test = new EmailField('value');
            testModel.value = 'Joe.Smith_21@gmail.com';
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully picks up an invalid e-mail address', () => {
            let test = new EmailField('value');
            testModel.value = 'Joe.Smith_not_an_email.com';
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('successfully validates a null value if field not required', () => {
            let test = new EmailField('value', { required: false });
            testModel.value = null;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

    });

    describe('URLField', () => {

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = Object.assign(
                {}, DEFAULT_FIELD_OPTIONS,
                { regEx: URL_REGEX }
            );
            let test = new URLField('value');
            expect(test).is.instanceof(TextField);
            expect(test.name).to.equal('value');
            expect(test.options).to.deep.equal(opts);
            expect(test.options.regEx).to.equal(URL_REGEX);
        });

        it('sets default field options if they are not specified', () => {
            let test = new URLField('value');
            expect(test.options).to.deep.equal(
                Object.assign({}, DEFAULT_FIELD_OPTIONS, {
                    regEx: URL_REGEX
                })
            );
        });

        it('allows the default url regex to be overridden', () => {
            let testRegex = /abc/;
            let test = new URLField('value', {
                regEx: testRegex
            });
            expect(test.options.regEx).to.equal(testRegex);
        });

        it('uses the default regex if an invalid regex is passed', () => {
            let testRegex = { test: 'flibble' };
            let test = new URLField('value', {
                regEx: testRegex as any
            });
            expect(test.options.regEx).to.equal(URL_REGEX);
        });

        it('successfully validates a valid url', () => {
            let test = new URLField('value');
            testModel.value = 'www.google.com';
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates a valid url with protocol', () => {
            let test = new URLField('value');
            testModel.value = 'https://www.google.com';
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully picks up an invalid url', () => {
            let test = new URLField('value');
            testModel.value = 'not_a_website_url';
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('successfully validates a null value if field not required', () => {
            let test = new URLField('value', { required: false });
            testModel.value = null;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });
    });

});
