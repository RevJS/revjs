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

});
