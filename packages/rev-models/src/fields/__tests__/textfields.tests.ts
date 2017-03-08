import { TextField, EmailField, EMAIL_ADDR_REGEX, URLField, URL_REGEX } from '../textfields';
import { ModelValidationResult } from '../../models/validation';
import { IFieldOptions, Field, DEFAULT_FIELD_OPTIONS } from '../field';
import { stringValidator, requiredValidator, stringEmptyValidator, minStringLengthValidator, maxStringLengthValidator, minValueValidator, maxValueValidator, regExValidator } from '../validators';

import { expect } from 'chai';

describe('rev.fields.textfields', () => {

    describe('TextField', () => {
        let testModel = {
            name: null as any
        };
        let testMeta = {
            fields: [new TextField('name')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new TextField('name', opts);
            expect(test.name).to.equal('name');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
            expect(test).is.instanceof(Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new TextField('name');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
        });

        it('adds the stringValidator by default', () => {
            let test = new TextField('name', { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(stringValidator);
        });

        it('adds the required and stringEmpty validators if options.required is true', () => {
            let test = new TextField('name', { required: true });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(stringValidator);
            expect(test.validators[2]).to.equal(stringEmptyValidator);
        });

        it('adds the minLength validator if options.minLength is set', () => {
            let test = new TextField('name', { required: false, minLength: 10 });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(minStringLengthValidator);
        });

        it('adds the maxLength validator if options.maxLength is set', () => {
            let test = new TextField('name', { required: false, maxLength: 10 });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(maxStringLengthValidator);
        });

        it('adds the minValue validator if options.minValue is set', () => {
            let test = new TextField('name', { required: false, minValue: 'a' });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(minValueValidator);
        });

        it('adds the maxValue validator if options.maxValue is set', () => {
            let test = new TextField('name', { required: false, maxValue: 'z' });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(maxValueValidator);
        });

        it('adds the regEx validator if options.regEx is set to a RegExp', () => {
            let test = new TextField('name', { required: false, regEx: /^T/ });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(regExValidator);
        });

        it('successfully validates a string value', () => {
            let test = new TextField('name', { required: true });
            testModel.name = 'Joe Smith';
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a string value that passes validation', () => {
            let test = new TextField('name', {
                required: true,
                minLength: 1,
                maxLength: 10,
                minValue: 'a',
                maxValue: 'z',
                regEx: /^abc/
            });
            testModel.name = 'abc123';
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new TextField('name', { required: false });
            testModel.name = null;
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new TextField('name', { required: true });
            testModel.name = null;
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate on non-string value', () => {
            let test = new TextField('name', { required: true });
            testModel.name = true;
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate a string if it does not match rules', () => {
            let test = new TextField('name', {
                required: true,
                minLength: 1,
                maxLength: 10,
                minValue: 'a',
                maxValue: 'd'
            });
            testModel.name = 'This string is too long and out of range';
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', false);
        });

    });

    describe('EmailField', () => {
        let testModel = {
            email: null as any
        };
        let testMeta = {
            fields: [new EmailField('email')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new EmailField('email', opts);
            expect(test).is.instanceof(TextField);
            expect(test.name).to.equal('email');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
            expect(test.options.regEx).to.equal(EMAIL_ADDR_REGEX);
        });

        it('sets default field options if they are not specified', () => {
            let test = new EmailField('email');
            expect(test.options).to.deep.equal(
                Object.assign({}, DEFAULT_FIELD_OPTIONS, {
                    regEx: EMAIL_ADDR_REGEX
                })
            );
        });

        it('allows the default e-mail address regex to be overridden', () => {
            let testRegex = /abc/;
            let test = new EmailField('email', {
                regEx: testRegex
            });
            expect(test.options.regEx).to.equal(testRegex);
        });

        it('uses the default regex if an invalid regex is passed', () => {
            let testRegex = { test: 'flibble' };
            let test = new EmailField('email', {
                regEx: testRegex as any
            });
            expect(test.options.regEx).to.equal(EMAIL_ADDR_REGEX);
        });

        it('successfully validates a valid e-mail address', () => {
            let test = new EmailField('email');
            testModel.email = 'Joe.Smith_21@gmail.com';
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully picks up an invalid e-mail address', () => {
            let test = new EmailField('email');
            testModel.email = 'Joe.Smith_not_an_email.com';
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', false);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new EmailField('email', { required: false });
            testModel.email = null;
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', true);
        });

    });

    describe('URLField', () => {
        let testModel = {
            website: null as any
        };
        let testMeta = {
            fields: [new URLField('website')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new URLField('website', opts);
            expect(test).is.instanceof(TextField);
            expect(test.name).to.equal('website');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
            expect(test.options.regEx).to.equal(URL_REGEX);
        });

        it('sets default field options if they are not specified', () => {
            let test = new URLField('website');
            expect(test.options).to.deep.equal(
                Object.assign({}, DEFAULT_FIELD_OPTIONS, {
                    regEx: URL_REGEX
                })
            );
        });

        it('allows the default url regex to be overridden', () => {
            let testRegex = /abc/;
            let test = new URLField('website', {
                regEx: testRegex
            });
            expect(test.options.regEx).to.equal(testRegex);
        });

        it('uses the default regex if an invalid regex is passed', () => {
            let testRegex = { test: 'flibble' };
            let test = new URLField('website', {
                regEx: testRegex as any
            });
            expect(test.options.regEx).to.equal(URL_REGEX);
        });

        it('successfully validates a valid url', () => {
            let test = new URLField('website');
            testModel.website = 'www.google.com';
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a valid url with protocol', () => {
            let test = new URLField('website');
            testModel.website = 'https://www.google.com';
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully picks up an invalid url', () => {
            let test = new URLField('website');
            testModel.website = 'not_a_website_url';
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', false);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new URLField('website', { required: false });
            testModel.website = null;
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', true);
        });
    });

});
