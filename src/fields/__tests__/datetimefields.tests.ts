import { DateField, TimeField, DateTimeField } from '../datetimefields';
import { ModelValidationResult } from '../../model/validation';
import { IFieldOptions, Field, DEFAULT_FIELD_OPTIONS } from '../field';
import { dateOnlyValidator, requiredValidator, timeOnlyValidator, dateTimeValidator } from '../validators';

import { expect } from 'chai';

describe('rev.fields.datetimefields', () => {

    describe('DateField', () => {
        let testModel = {
            value: <any> null
        };
        let testMeta = {
            fields: [new DateField('value', 'Value')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new DateField('value', 'Value', opts);
            expect(test.name).to.equal('value');
            expect(test.label).to.equal('Value');
            expect(test.options).to.equal(opts);
            expect(test).is.instanceof(Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new DateField('value', 'Value');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
        });

        it('adds the dateOnlyValidator by default', () => {
            let test = new DateField('value', 'Value', { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(dateOnlyValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new DateField('value', 'Value', { required: true });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(dateOnlyValidator);
        });

        it('successfully validates a date value', () => {
            let test = new DateField('value', 'Value', { required: true });
            testModel.value = new Date(2016, 12, 23);
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a date value in a string', () => {
            let test = new DateField('value', 'Value', { required: true });
            testModel.value = '2016-12-23';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new DateField('value', 'Value', { required: false });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new DateField('value', 'Value', { required: true });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate a non-date value', () => {
            let test = new DateField('value', 'Value', { required: true });
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
            fields: [new TimeField('value', 'Value')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new TimeField('value', 'Value', opts);
            expect(test.name).to.equal('value');
            expect(test.label).to.equal('Value');
            expect(test.options).to.equal(opts);
            expect(test).is.instanceof(Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new TimeField('value', 'Value');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
        });

        it('adds the timeOnlyValidator by default', () => {
            let test = new TimeField('value', 'Value', { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(timeOnlyValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new TimeField('value', 'Value', { required: true });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(timeOnlyValidator);
        });

        it('successfully validates a date object value', () => {
            let test = new TimeField('value', 'Value', { required: true });
            testModel.value = new Date(2016, 12, 23, 15, 27, 32);
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a time value in a string', () => {
            let test = new TimeField('value', 'Value', { required: true });
            testModel.value = '15:27:32';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new TimeField('value', 'Value', { required: false });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new TimeField('value', 'Value', { required: true });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate a non-time value', () => {
            let test = new TimeField('value', 'Value', { required: true });
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
            fields: [new DateTimeField('value', 'Value')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new DateTimeField('value', 'Value', opts);
            expect(test.name).to.equal('value');
            expect(test.label).to.equal('Value');
            expect(test.options).to.equal(opts);
            expect(test).is.instanceof(Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new DateTimeField('value', 'Value');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
        });

        it('adds the dateTimeValidator by default', () => {
            let test = new DateTimeField('value', 'Value', { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(dateTimeValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new DateTimeField('value', 'Value', { required: true });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(dateTimeValidator);
        });

        it('successfully validates a date and time value', () => {
            let test = new DateTimeField('value', 'Value', { required: true });
            testModel.value = new Date(2016, 12, 23, 11, 22, 33);
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a date time value in a string', () => {
            let test = new DateTimeField('value', 'Value', { required: true });
            testModel.value = '2016-12-23T21:32:43';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new DateTimeField('value', 'Value', { required: false });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new DateTimeField('value', 'Value', { required: true });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate a non-datetime value', () => {
            let test = new DateTimeField('value', 'Value', { required: true });
            testModel.value = 'I am a non-datetime value';
            return expect(test.validate(testModel, testMeta, 'create', result))
                .to.eventually.have.property('valid', false);
        });

    });

});
