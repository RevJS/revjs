import { Field } from '../index';
import { IModelMeta } from '../../model/meta';
import { IModel, ValidationMode } from '../../model';
import { expect } from 'chai';
import * as fld from '../index';
import * as vld from '../validators';

import { ModelValidationResult } from '../../model/validationresult';

function quickValidAsyncValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult) {
    return new Promise<void>((resolve, reject) => {
        resolve();
    });
}

function quickInvalidAsyncValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult) {
    return new Promise<void>((resolve, reject) => {
        result.addFieldError('name', 'name field is invalid');
        resolve();
    });
}

function slowInvalidAsyncValidator<T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult) {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            result.addFieldError('name', 'name field is invalid');
            resolve();
        }, 8000);
    });
}

describe('rev.fields', () => {

    describe('Field - constructor()', () => {

        it('creates a field with properties as expected', () => {
            let opts: fld.IFieldOptions = {
                required: true
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
            let test = new fld.Field('name', 'Name', { });
            expect(test.validators[0]).to.equal(vld.requiredValidator);
        });

        it('does not add any validators if options.required is false', () => {
            let test = new fld.Field('name', 'Name', { required: false });
            expect(test.validators.length).to.equal(0);
        });

    });

    describe('Field - validate()', () => {
        let testModel = {
            name: <any> null
        };
        let testMeta = {
            fields: [new fld.Field('name', 'Name')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('returns a resolved promise when validation completes - no validators', () => {
            let test = new fld.Field('name', 'Name', { required: false });
            return expect(
                test.validate(testModel, testMeta, 'create', result)
            ).to.eventually.have.property('valid', true);
        });

        it('returns a resolved promise when validation completes - required validator', () => {
            let test = new fld.Field('name', 'Name', { required: true });
            testModel.name = 'Frank';
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

        it('returns valid = true when validation completes with a valid async validator', () => {
            let test = new fld.Field('name', 'Name', { required: false });
            test.asyncValidators.push(quickValidAsyncValidator);
            return expect(
                test.validate(testModel, testMeta, 'create', result)
            ).to.eventually.have.property('valid', true);
        });

        it('returns valid = false when validation completes with an invalid async validator', () => {
            let test = new fld.Field('name', 'Name', { required: false });
            test.asyncValidators.push(quickInvalidAsyncValidator);
            return expect(
                test.validate(testModel, testMeta, 'create', result)
            ).to.eventually.have.property('valid', false);
        });

        it('returns valid = false when validation completes with a valid and an invalid async validator', () => {
            let test = new fld.Field('name', 'Name', { required: false });
            test.asyncValidators.push(quickValidAsyncValidator);
            test.asyncValidators.push(quickInvalidAsyncValidator);
            return expect(
                test.validate(testModel, testMeta, 'create', result)
            ).to.eventually.have.property('valid', false);
        });

        it('returns a rejected promise when async validation times out', () => {
            let test = new fld.Field('name', 'Name', { required: false });
            test.asyncValidators.push(slowInvalidAsyncValidator);
            return expect(
                test.validate(testModel, testMeta, 'create', result, {
                    timeout: 100
                })
            ).to.be.rejectedWith('timed out');
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

    describe('URLField', () => {
        let testModel = {
            website: <any> null
        };
        let testMeta = {
            fields: [new fld.URLField('website', 'Website')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: fld.IFieldOptions = {};
            let test = new fld.URLField('website', 'Website', opts);
            expect(test).is.instanceof(fld.TextField);
            expect(test.name).to.equal('website');
            expect(test.label).to.equal('Website');
            expect(test.options).to.equal(opts);
            expect(test.options.regEx).to.equal(fld.URL_REGEX);
        });

        it('sets default field options if they are not specified', () => {
            let test = new fld.URLField('website', 'Website');
            expect(test.options).to.deep.equal(
                Object.assign({}, fld.DEFAULT_FIELD_OPTIONS, {
                    regEx: fld.URL_REGEX
                })
            );
        });

        it('allows the default url regex to be overridden', () => {
            let testRegex = /abc/
            let test = new fld.URLField('website', 'Website', {
                regEx: testRegex
            });
            expect(test.options.regEx).to.equal(testRegex);
        });

        it('uses the default regex if an invalid regex is passed', () => {
            let testRegex = { test: 'flibble' };
            let test = new fld.URLField('website', 'Website', {
                regEx: <any> testRegex
            });
            expect(test.options.regEx).to.equal(fld.URL_REGEX);
        });

        it('successfully validates a valid url', () => {
            let test = new fld.URLField('website', 'Website');
            testModel.website = 'www.google.com';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a valid url with protocol', () => {
            let test = new fld.URLField('website', 'Website');
            testModel.website = 'https://www.google.com';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully picks up an invalid url', () => {
            let test = new fld.URLField('website', 'Website');
            testModel.website = 'not_a_website_url';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new fld.URLField('website', 'Website', { required: false });
            testModel.website = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });
    });

    describe('NumberField', () => {
        let testModel = {
            value: <any> null
        };
        let testMeta = {
            fields: [new fld.NumberField('value', 'Value')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: fld.IFieldOptions = {};
            let test = new fld.NumberField('value', 'Value', opts);
            expect(test.name).to.equal('value');
            expect(test.label).to.equal('Value');
            expect(test.options).to.equal(opts);
            expect(test).is.instanceof(fld.Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new fld.NumberField('value', 'Value');
            expect(test.options).to.deep.equal(fld.DEFAULT_FIELD_OPTIONS);
        });

        it('adds the numberValidator by default', () => {
            let test = new fld.NumberField('value', 'Value', { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(vld.numberValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new fld.NumberField('value', 'Value', { required: true });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(vld.requiredValidator);
            expect(test.validators[1]).to.equal(vld.numberValidator);
        });

        it('adds the minValue validator if options.minValue is set', () => {
            let test = new fld.NumberField('value', 'Value', { required: false, minValue: 'a' });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(vld.minValueValidator);
        });

        it('adds the maxValue validator if options.maxValue is set', () => {
            let test = new fld.NumberField('value', 'Value', { required: false, maxValue: 'z' });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[1]).to.equal(vld.maxValueValidator);
        });

        it('successfully validates a number value', () => {
            let test = new fld.NumberField('value', 'Value', { required: true });
            testModel.value = 42.5;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a number value in a string', () => {
            let test = new fld.NumberField('value', 'Value', { required: true });
            testModel.value = '12.345';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a numeric value that passes validation', () => {
            let test = new fld.NumberField('value', 'Value', {
                required: true,
                minValue: 40,
                maxValue: 50
            });
            testModel.value = 42.123;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new fld.NumberField('value', 'Value', { required: false });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new fld.NumberField('value', 'Value', { required: true });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate on non-numeric value', () => {
            let test = new fld.NumberField('value', 'Value', { required: true });
            testModel.value = 'I am a number, honest guv!...';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate a number if it does not match rules', () => {
            let test = new fld.NumberField('value', 'Value', {
                required: true,
                minValue: 40.1,
                maxValue: 50.2
            });
            testModel.value = 22.72;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

    });

    describe('IntegerField', () => {
        let testModel = {
            value: <any> null
        };
        let testMeta = {
            fields: [new fld.IntegerField('value', 'Value')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: fld.IFieldOptions = {};
            let test = new fld.IntegerField('value', 'Value', opts);
            expect(test.name).to.equal('value');
            expect(test.label).to.equal('Value');
            expect(test.options).to.equal(opts);
            expect(test).is.instanceof(fld.NumberField);
        });

        it('sets default field options if they are not specified', () => {
            let test = new fld.IntegerField('value', 'Value');
            expect(test.options).to.deep.equal(fld.DEFAULT_FIELD_OPTIONS);
        });

        it('adds the integerValidator by default', () => {
            let test = new fld.IntegerField('value', 'Value', { required: false });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(vld.numberValidator);
            expect(test.validators[1]).to.equal(vld.integerValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new fld.IntegerField('value', 'Value', { required: true });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[0]).to.equal(vld.requiredValidator);
            expect(test.validators[1]).to.equal(vld.numberValidator);
            expect(test.validators[2]).to.equal(vld.integerValidator);
        });

        it('adds the minValue validator if options.minValue is set', () => {
            let test = new fld.IntegerField('value', 'Value', { required: false, minValue: 'a' });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[2]).to.equal(vld.minValueValidator);
        });

        it('adds the maxValue validator if options.maxValue is set', () => {
            let test = new fld.IntegerField('value', 'Value', { required: false, maxValue: 'z' });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[2]).to.equal(vld.maxValueValidator);
        });

        it('successfully validates an integer value', () => {
            let test = new fld.IntegerField('value', 'Value', { required: true });
            testModel.value = 42;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates an integer value in a string', () => {
            let test = new fld.IntegerField('value', 'Value', { required: true });
            testModel.value = '12';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates an integer value that passes validation', () => {
            let test = new fld.IntegerField('value', 'Value', {
                required: true,
                minValue: 40,
                maxValue: 50
            });
            testModel.value = 42;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new fld.IntegerField('value', 'Value', { required: false });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new fld.IntegerField('value', 'Value', { required: true });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate on non-integer value', () => {
            let test = new fld.IntegerField('value', 'Value', { required: true });
            testModel.value = 42.5;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate an integer if it does not match rules', () => {
            let test = new fld.IntegerField('value', 'Value', {
                required: true,
                minValue: 40,
                maxValue: 50
            });
            testModel.value = 22;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

    });

    describe('DateField', () => {
        let testModel = {
            value: <any> null
        };
        let testMeta = {
            fields: [new fld.DateField('value', 'Value')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: fld.IFieldOptions = {};
            let test = new fld.DateField('value', 'Value', opts);
            expect(test.name).to.equal('value');
            expect(test.label).to.equal('Value');
            expect(test.options).to.equal(opts);
            expect(test).is.instanceof(fld.Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new fld.DateField('value', 'Value');
            expect(test.options).to.deep.equal(fld.DEFAULT_FIELD_OPTIONS);
        });

        it('adds the dateOnlyValidator by default', () => {
            let test = new fld.DateField('value', 'Value', { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(vld.dateOnlyValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new fld.DateField('value', 'Value', { required: true });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(vld.requiredValidator);
            expect(test.validators[1]).to.equal(vld.dateOnlyValidator);
        });

        it('successfully validates a date value', () => {
            let test = new fld.DateField('value', 'Value', { required: true });
            testModel.value = new Date(2016, 12, 23);
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a date value in a string', () => {
            let test = new fld.DateField('value', 'Value', { required: true });
            testModel.value = '2016-12-23';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new fld.DateField('value', 'Value', { required: false });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new fld.DateField('value', 'Value', { required: true });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate a non-date value', () => {
            let test = new fld.DateField('value', 'Value', { required: true });
            testModel.value = 'I am a date, honest guv!...';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

    });

    describe('TimeField', () => {
        let testModel = {
            value: <any> null
        };
        let testMeta = {
            fields: [new fld.TimeField('value', 'Value')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: fld.IFieldOptions = {};
            let test = new fld.TimeField('value', 'Value', opts);
            expect(test.name).to.equal('value');
            expect(test.label).to.equal('Value');
            expect(test.options).to.equal(opts);
            expect(test).is.instanceof(fld.Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new fld.TimeField('value', 'Value');
            expect(test.options).to.deep.equal(fld.DEFAULT_FIELD_OPTIONS);
        });

        it('adds the timeOnlyValidator by default', () => {
            let test = new fld.TimeField('value', 'Value', { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(vld.timeOnlyValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new fld.TimeField('value', 'Value', { required: true });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(vld.requiredValidator);
            expect(test.validators[1]).to.equal(vld.timeOnlyValidator);
        });

        it('successfully validates a date object value', () => {
            let test = new fld.TimeField('value', 'Value', { required: true });
            testModel.value = new Date(2016, 12, 23, 15, 27, 32);
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a time value in a string', () => {
            let test = new fld.TimeField('value', 'Value', { required: true });
            testModel.value = '15:27:32';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new fld.TimeField('value', 'Value', { required: false });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new fld.TimeField('value', 'Value', { required: true });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate a non-time value', () => {
            let test = new fld.TimeField('value', 'Value', { required: true });
            testModel.value = 'Time you got a watch!...';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

    });

    describe('DateTimeField', () => {
        let testModel = {
            value: <any> null
        };
        let testMeta = {
            fields: [new fld.DateTimeField('value', 'Value')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: fld.IFieldOptions = {};
            let test = new fld.DateTimeField('value', 'Value', opts);
            expect(test.name).to.equal('value');
            expect(test.label).to.equal('Value');
            expect(test.options).to.equal(opts);
            expect(test).is.instanceof(fld.Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new fld.DateTimeField('value', 'Value');
            expect(test.options).to.deep.equal(fld.DEFAULT_FIELD_OPTIONS);
        });

        it('adds the dateTimeValidator by default', () => {
            let test = new fld.DateTimeField('value', 'Value', { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(vld.dateTimeValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new fld.DateTimeField('value', 'Value', { required: true });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(vld.requiredValidator);
            expect(test.validators[1]).to.equal(vld.dateTimeValidator);
        });

        it('successfully validates a date and time value', () => {
            let test = new fld.DateTimeField('value', 'Value', { required: true });
            testModel.value = new Date(2016, 12, 23, 11, 22, 33);
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a date time value in a string', () => {
            let test = new fld.DateTimeField('value', 'Value', { required: true });
            testModel.value = '2016-12-23T21:32:43';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new fld.DateTimeField('value', 'Value', { required: false });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new fld.DateTimeField('value', 'Value', { required: true });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate a non-datetime value', () => {
            let test = new fld.DateTimeField('value', 'Value', { required: true });
            testModel.value = 'I am a non-datetime value';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

    });

    describe('SelectionField', () => {
        let testModel = {
            value: <any> null
        };
        let selection = [
            ['option1', 'Option 1'],
            ['option2', 'Option 2'],
            ['option3', 'Option 3']
        ];
        let testMeta = {
            fields: [new fld.SelectionField('value', 'Value', selection)]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: fld.IFieldOptions = {};
            let test = new fld.SelectionField('value', 'Value', selection, opts);
            expect(test.name).to.equal('value');
            expect(test.label).to.equal('Value');
            expect(test.selection).to.equal(selection);
            expect(test.options).to.equal(opts);
            expect(test).is.instanceof(fld.Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new fld.SelectionField('value', 'Value', selection);
            expect(test.options).to.deep.equal(fld.DEFAULT_FIELD_OPTIONS);
        });

        it('adds the singleSelectionValidator by default', () => {
            let test = new fld.SelectionField('value', 'Value', selection, { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(vld.singleSelectionValidator);
        });

        it('adds the required validator and stringEmpty validator if options.required is true', () => {
            let test = new fld.SelectionField('value', 'Value', selection, { required: true });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[0]).to.equal(vld.requiredValidator);
            expect(test.validators[1]).to.equal(vld.stringEmptyValidator);
            expect(test.validators[2]).to.equal(vld.singleSelectionValidator);
        });

        it('adds the required validator and listEmpty validator if options.required is true and multiple = true', () => {
            let test = new fld.SelectionField('value', 'Value', selection, { required: true, multiple: true });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[0]).to.equal(vld.requiredValidator);
            expect(test.validators[1]).to.equal(vld.listEmptyValidator);
            expect(test.validators[2]).to.equal(vld.multipleSelectionValidator);
        });

        it('adds the multipleSelectionValidator if opts.multiple = true', () => {
            let test = new fld.SelectionField('value', 'Value', selection, { required: false, multiple: true });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(vld.multipleSelectionValidator);
        });

        it('cannot be created with a selection that is not an array', () => {
            expect(() => {
                let test = new fld.SelectionField('value', 'Value', <any> 'aaa');
            }).to.throw('"selection" parameter must be an array');
        });

        it('cannot be created with a single-dimension selection array', () => {
            expect(() => {
                let test = new fld.SelectionField('value', 'Value', <any> ['aaa', 'bbb']);
            }).to.throw('should be an array with two items');
        });

        it('cannot be created with a two-dimensional selection array with the wrong number of items', () => {
            expect(() => {
                let test = new fld.SelectionField('value', 'Value', [
                    ['aaa'],
                    ['bbb', 'ccc'],
                    ['ddd', 'eee', 'fff']
                ]);
            }).to.throw('should be an array with two items');
        });

        it('successfully validates a single value', () => {
            let test = new fld.SelectionField('value', 'Value', selection);
            testModel.value = 'option2';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates multiple values', () => {
            let test = new fld.SelectionField('value', 'Value', selection, { multiple: true });
            testModel.value = ['option1', 'option3'];
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new fld.SelectionField('value', 'Value', selection, { required: false });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new fld.SelectionField('value', 'Value', selection, { required: true });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate an invalid single value', () => {
            let test = new fld.SelectionField('value', 'Value', selection);
            testModel.value = 'I am not an option';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate an invalid multi-value', () => {
            let test = new fld.SelectionField('value', 'Value', selection);
            testModel.value = ['option1', 'nope', 'option3'];
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

    });

});
