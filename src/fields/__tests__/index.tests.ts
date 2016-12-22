import { expect } from 'chai';
import * as fld from '../index';
import * as vld from '../validators';

import { ModelValidationResult } from '../../model/validationresult';

describe('rev.fields', () => {

    describe('Field - constructor()', () => {

        it('creates a field with properties as expected', () => {
            let opts: fld.IFieldOptions = {
                required: true,
                maxLength: 100
            };
            let test = new fld.Field('name', 'Name', opts);
            expect(test.name).to.equal('name');
            expect(test.label).to.equal('Name');
            expect(test.options).to.equal(opts);
        });

        it('cannot be created without a name', () => {
            expect(() => {
                let test = new fld.Field(undefined, undefined);
            }).to.throw('new fields must have a name');
        });

        it('cannot be created without a label', () => {
            expect(() => {
                let test = new fld.Field('name', undefined);
            }).to.throw('new fields must have a label');
        });

        it('sets default field options if they are not specified', () => {
            let test = new fld.Field('name', 'Name');
            expect(test.options).to.deep.equal(fld.DEFAULT_FIELD_OPTIONS);
        });

        it('throws an error if options is not an object', () => {
            expect(() => {
                let test = new fld.Field('name', 'Name', () => '33');
            }).to.throw('the options parameter must be an object');
        });

        it('adds the "required" validator if options.required is true', () => {
            let test = new fld.Field('name', 'Name', { required: true });
            expect(test.validators[0]).to.equal(vld.requiredValidator);
        });

        it('adds the "required" validator if options.required is not specified', () => {
            let test = new fld.Field('name', 'Name', { maxLength: 20 });
            expect(test.validators[0]).to.equal(vld.requiredValidator);
        });

        it('does not add any validators if options.required is false', () => {
            let test = new fld.Field('name', 'Name', { required: false });
            expect(test.validators.length).to.equal(0);
        });

    });

    describe('Field - validate()', () => {
        let testModel = {
            name: 'Frank'
        };
        let testMeta = {
            fields: [new fld.Field('name', 'Name')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('returns a resolved promise when validation completes - no validators', () => {
            let test = new fld.Field('name', 'Name');
            return expect(
                test.validate(testModel, testMeta, 'create', result)
            ).to.eventually.have.property('valid', true);
        });

        it('returns a resolved promise when validation completes - required validator', () => {
            let test = new fld.Field('name', 'Name', { required: true });
            return expect(
                test.validate(testModel, testMeta, 'create', result)
            ).to.eventually.have.property('valid', true);
        });

        it('validation fails as expected when required field not set', () => {
            let test = new fld.Field('name', 'Name', { required: true });
            return expect(
                test.validate({ name: null }, testMeta, 'create', result)
            ).to.eventually.have.property('valid', false);
        });

        it('throws an error if a model instance is not passed', () => {
            let test = new fld.Field('name', 'Name');
            expect(() => {
                test.validate(<any> 'test', testMeta, 'create', result);
            }).to.throw('not a model instance');
        });

    });

    describe('BooleanField', () => {
        let testModel = {
            is_awesome: <any> null
        };
        let testMeta = {
            fields: [new fld.BooleanField('is_awesome', 'Awesome?')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: fld.IFieldOptions = {};
            let test = new fld.BooleanField('is_awesome', 'Awesome?', opts);
            expect(test.name).to.equal('is_awesome');
            expect(test.label).to.equal('Awesome?');
            expect(test.options).to.equal(opts);
            expect(test).is.instanceof(fld.Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new fld.BooleanField('is_awesome', 'Awesome?');
            expect(test.options).to.deep.equal(fld.DEFAULT_FIELD_OPTIONS);
        });

        it('adds the booleanValidator by default', () => {
            let test = new fld.BooleanField('is_awesome', 'Awesome?', { required: false });
            expect(test.validators[0]).to.equal(vld.booleanValidator);
        });

        it('adds the "required" validator if options.required is true', () => {
            let test = new fld.BooleanField('is_awesome', 'Awesome?', { required: true });
            expect(test.validators[0]).to.equal(vld.requiredValidator);
            expect(test.validators[1]).to.equal(vld.booleanValidator);
        });

        it('successfully validates a boolean value', () => {
            let test = new fld.BooleanField('is_awesome', 'Awesome?', { required: true });
            testModel.is_awesome = false;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new fld.BooleanField('is_awesome', 'Awesome?', { required: false });
            testModel.is_awesome = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new fld.BooleanField('is_awesome', 'Awesome?', { required: true });
            testModel.is_awesome = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate on non-boolean value', () => {
            let test = new fld.BooleanField('is_awesome', 'Awesome?', { required: true });
            testModel.is_awesome = 'evidently!';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

    });

    describe('TextField', () => {
        let testModel = {
            name: <any> null
        };
        let testMeta = {
            fields: [new fld.TextField('name', 'Name')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: fld.IFieldOptions = {};
            let test = new fld.TextField('name', 'Name', opts);
            expect(test.name).to.equal('name');
            expect(test.label).to.equal('Name');
            expect(test.options).to.equal(opts);
            expect(test).is.instanceof(fld.Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new fld.TextField('name', 'Name');
            expect(test.options).to.deep.equal(fld.DEFAULT_FIELD_OPTIONS);
        });

        it('adds the stringValidator by default', () => {
            let test = new fld.TextField('name', 'Name', { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(vld.stringValidator);
        });

        it('adds the required and stringEmpty validators if options.required is true', () => {
            let test = new fld.TextField('name', 'Name', { required: true });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[0]).to.equal(vld.requiredValidator);
            expect(test.validators[1]).to.equal(vld.stringValidator);
            expect(test.validators[2]).to.equal(vld.stringEmptyValidator);
        });

        it('adds the minLength validator if options.minLength is set', () => {
            let test = new fld.TextField('name', 'Name', { required: false, minLength: 10 });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(vld.minStringLengthValidator);
        });

        it('adds the maxLength validator if options.maxLength is set', () => {
            let test = new fld.TextField('name', 'Name', { required: false, maxLength: 10 });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(vld.maxStringLengthValidator);
        });

        it('adds the minValue validator if options.minValue is set', () => {
            let test = new fld.TextField('name', 'Name', { required: false, minValue: 'a' });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(vld.minValueValidator);
        });

        it('adds the maxValue validator if options.maxValue is set', () => {
            let test = new fld.TextField('name', 'Name', { required: false, maxValue: 'z' });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(vld.maxValueValidator);
        });

        it('adds the regEx validator if options.regEx is set to a RegExp', () => {
            let test = new fld.TextField('name', 'Name', { required: false, regEx: /^T/ });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(vld.regExValidator);
        });

        it('successfully validates a string value', () => {
            let test = new fld.TextField('name', 'Name', { required: true });
            testModel.name = 'Joe Smith';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a string value that passes validation', () => {
            let test = new fld.TextField('name', 'Name', {
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
            let test = new fld.TextField('name', 'Name', { required: false });
            testModel.name = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new fld.TextField('name', 'Name', { required: true });
            testModel.name = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate on non-string value', () => {
            let test = new fld.TextField('name', 'Name', { required: true });
            testModel.name = true;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate a string if it does not match rules', () => {
            let test = new fld.TextField('name', 'Name', {
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
            fields: [new fld.EmailField('email', 'E-mail')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: fld.IFieldOptions = {};
            let test = new fld.EmailField('email', 'E-mail', opts);
            expect(test).is.instanceof(fld.TextField);
            expect(test.name).to.equal('email');
            expect(test.label).to.equal('E-mail');
            expect(test.options).to.equal(opts);
            expect(test.options.regEx).to.equal(fld.EMAIL_ADDR_REGEX);
        });

        it('sets default field options if they are not specified', () => {
            let test = new fld.EmailField('email', 'E-mail');
            expect(test.options).to.deep.equal(
                Object.assign({}, fld.DEFAULT_FIELD_OPTIONS, {
                    regEx: fld.EMAIL_ADDR_REGEX
                })
            );
        });

        it('allows the default e-mail address regex to be overridden', () => {
            let testRegex = /abc/
            let test = new fld.EmailField('email', 'E-mail', {
                regEx: testRegex
            });
            expect(test.options.regEx).to.equal(testRegex);
        });

        it('uses the default regex if an invalid regex is passed', () => {
            let testRegex = { test: 'flibble' };
            let test = new fld.EmailField('email', 'E-mail', {
                regEx: <any> testRegex
            });
            expect(test.options.regEx).to.equal(fld.EMAIL_ADDR_REGEX);
        });

        it('successfully validates a valid e-mail address', () => {
            let test = new fld.EmailField('email', 'E-mail');
            testModel.email = 'Joe.Smith_21@gmail.com';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully picks up an invalid e-mail address', () => {
            let test = new fld.EmailField('email', 'E-mail');
            testModel.email = 'Joe.Smith_not_an_email.com';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new fld.EmailField('email', 'E-mail', { required: false });
            testModel.email = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

    });

});
