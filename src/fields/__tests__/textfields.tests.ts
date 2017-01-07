import { TextField, EmailField, EMAIL_ADDR_REGEX, URLField, URL_REGEX } from '../textfields';
import { ModelValidationResult } from '../../models/validation';
import { IFieldOptions, Field, DEFAULT_FIELD_OPTIONS } from '../field';
import { stringValidator, requiredValidator, stringEmptyValidator, minStringLengthValidator, maxStringLengthValidator, minValueValidator, maxValueValidator, regExValidator } from '../validators';

import { expect } from 'chai';

describe('rev.fields.textfields', () => {

    describe('TextField', () => {
        let testModel = {
            name: <any> null
        };
        let testMeta = {
            fields: [new TextField('name', 'Name')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new TextField('name', 'Name', opts);
            expect(test.name).to.equal('name');
            expect(test.label).to.equal('Name');
            expect(test.options).to.equal(opts);
            expect(test).is.instanceof(Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new TextField('name', 'Name');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
        });

        it('adds the stringValidator by default', () => {
            let test = new TextField('name', 'Name', { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(stringValidator);
        });

        it('adds the required and stringEmpty validators if options.required is true', () => {
            let test = new TextField('name', 'Name', { required: true });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(stringValidator);
            expect(test.validators[2]).to.equal(stringEmptyValidator);
        });

        it('adds the minLength validator if options.minLength is set', () => {
            let test = new TextField('name', 'Name', { required: false, minLength: 10 });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(minStringLengthValidator);
        });

        it('adds the maxLength validator if options.maxLength is set', () => {
            let test = new TextField('name', 'Name', { required: false, maxLength: 10 });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(maxStringLengthValidator);
        });

        it('adds the minValue validator if options.minValue is set', () => {
            let test = new TextField('name', 'Name', { required: false, minValue: 'a' });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(minValueValidator);
        });

        it('adds the maxValue validator if options.maxValue is set', () => {
            let test = new TextField('name', 'Name', { required: false, maxValue: 'z' });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(maxValueValidator);
        });

        it('adds the regEx validator if options.regEx is set to a RegExp', () => {
            let test = new TextField('name', 'Name', { required: false, regEx: /^T/ });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(regExValidator);
        });

        it('successfully validates a string value', () => {
            let test = new TextField('name', 'Name', { required: true });
            testModel.name = 'Joe Smith';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a string value that passes validation', () => {
            let test = new TextField('name', 'Name', {
                required: true,
                minLength: 1,
                maxLength: 10,
                minValue: 'a',
                maxValue: 'z',
                regEx: /^abc/
            });
            testModel.name = 'abc123';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new TextField('name', 'Name', { required: false });
            testModel.name = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new TextField('name', 'Name', { required: true });
            testModel.name = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate on non-string value', () => {
            let test = new TextField('name', 'Name', { required: true });
            testModel.name = true;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate a string if it does not match rules', () => {
            let test = new TextField('name', 'Name', {
                required: true,
                minLength: 1,
                maxLength: 10,
                minValue: 'a',
                maxValue: 'd'
            });
            testModel.name = 'This string is too long and out of range';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

    });

    describe('EmailField', () => {
        let testModel = {
            email: <any> null
        };
        let testMeta = {
            fields: [new EmailField('email', 'E-mail')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new EmailField('email', 'E-mail', opts);
            expect(test).is.instanceof(TextField);
            expect(test.name).to.equal('email');
            expect(test.label).to.equal('E-mail');
            expect(test.options).to.equal(opts);
            expect(test.options.regEx).to.equal(EMAIL_ADDR_REGEX);
        });

        it('sets default field options if they are not specified', () => {
            let test = new EmailField('email', 'E-mail');
            expect(test.options).to.deep.equal(
                Object.assign({}, DEFAULT_FIELD_OPTIONS, {
                    regEx: EMAIL_ADDR_REGEX
                })
            );
        });

        it('allows the default e-mail address regex to be overridden', () => {
            let testRegex = /abc/;
            let test = new EmailField('email', 'E-mail', {
                regEx: testRegex
            });
            expect(test.options.regEx).to.equal(testRegex);
        });

        it('uses the default regex if an invalid regex is passed', () => {
            let testRegex = { test: 'flibble' };
            let test = new EmailField('email', 'E-mail', {
                regEx: <any> testRegex
            });
            expect(test.options.regEx).to.equal(EMAIL_ADDR_REGEX);
        });

        it('successfully validates a valid e-mail address', () => {
            let test = new EmailField('email', 'E-mail');
            testModel.email = 'Joe.Smith_21@gmail.com';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully picks up an invalid e-mail address', () => {
            let test = new EmailField('email', 'E-mail');
            testModel.email = 'Joe.Smith_not_an_email.com';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new EmailField('email', 'E-mail', { required: false });
            testModel.email = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

    });

    describe('URLField', () => {
        let testModel = {
            website: <any> null
        };
        let testMeta = {
            fields: [new URLField('website', 'Website')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new URLField('website', 'Website', opts);
            expect(test).is.instanceof(TextField);
            expect(test.name).to.equal('website');
            expect(test.label).to.equal('Website');
            expect(test.options).to.equal(opts);
            expect(test.options.regEx).to.equal(URL_REGEX);
        });

        it('sets default field options if they are not specified', () => {
            let test = new URLField('website', 'Website');
            expect(test.options).to.deep.equal(
                Object.assign({}, DEFAULT_FIELD_OPTIONS, {
                    regEx: URL_REGEX
                })
            );
        });

        it('allows the default url regex to be overridden', () => {
            let testRegex = /abc/;
            let test = new URLField('website', 'Website', {
                regEx: testRegex
            });
            expect(test.options.regEx).to.equal(testRegex);
        });

        it('uses the default regex if an invalid regex is passed', () => {
            let testRegex = { test: 'flibble' };
            let test = new URLField('website', 'Website', {
                regEx: <any> testRegex
            });
            expect(test.options.regEx).to.equal(URL_REGEX);
        });

        it('successfully validates a valid url', () => {
            let test = new URLField('website', 'Website');
            testModel.website = 'www.google.com';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a valid url with protocol', () => {
            let test = new URLField('website', 'Website');
            testModel.website = 'https://www.google.com';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully picks up an invalid url', () => {
            let test = new URLField('website', 'Website');
            testModel.website = 'not_a_website_url';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new URLField('website', 'Website', { required: false });
            testModel.website = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });
    });

});
