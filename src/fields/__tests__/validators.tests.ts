import { IValidationOptions } from './../index';
import { IModelMeta } from './../../model/index';
import { expect } from 'chai';
import * as fld from '../index';
import * as vld from '../validators';
import { VALIDATION_MESSAGES as msg } from '../validationmsg';

import { ModelValidationResult } from '../../model/validationresult';

class TestModel {
    id: any;
    name: any;
    age: any;
}
let nameField = new fld.TextField('name', 'Name', {
    minLength: 5, maxLength: 10
});
let idField = new fld.IntegerField('id', 'Id');
let ageField = new fld.NumberField('age', 'Age');

let meta: IModelMeta<TestModel> = {
    fields: [idField, nameField, ageField]
};
let opts: IValidationOptions = {
    checkAllValidators: true,
    timeout: 200
};

function expectFailure(validatorName: string, fieldName: string, message: string, vResult: ModelValidationResult) {
    expect(vResult.valid).to.equal(false);
    expect(vResult.fieldErrors[fieldName].length).to.equal(1);
    expect(vResult.fieldErrors[fieldName][0]).to.deep.equal({
        message: message,
        validator: validatorName
    });
}

describe('rev.fields.validators', () => {
    let vResult: ModelValidationResult;

    beforeEach(() => {
        vResult = new ModelValidationResult();
    });

    describe('requiredValidator()', () => {

        it('returns valid = true when a value is specified', () => {
            let test = new TestModel();
            test.name = 'flibble';
            vld.requiredValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value is not defined', () => {
            let test = new TestModel();
            vld.requiredValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('required', nameField.name, msg.required(nameField.label), vResult);
        });

        it('returns valid = false when a value is null', () => {
            let test = new TestModel();
            test.name = null;
            vld.requiredValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('required', nameField.name, msg.required(nameField.label), vResult);
        });

    });

    describe('stringValidator()', () => {

        it('returns valid = true when a string is specified', () => {
            let test = new TestModel();
            test.name = 'flibble';
            vld.stringValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value is not defined', () => {
            let test = new TestModel();
            vld.stringValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('not_a_string', nameField.name, msg.not_a_string(nameField.label), vResult);
        });

        it('returns valid = false when a value is not a string', () => {
            let test = new TestModel();
            test.name = 22;
            vld.stringValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('not_a_string', nameField.name, msg.not_a_string(nameField.label), vResult);
        });

    });

    describe('stringEmptyValidator()', () => {

        it('returns valid = true when a string is specified', () => {
            let test = new TestModel();
            test.name = 'flibble';
            vld.stringEmptyValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true for a string of spaces', () => {
            let test = new TestModel();
            test.name = '    ';
            vld.stringEmptyValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true for a string with other whitespace characters', () => {
            let test = new TestModel();
            test.name = '  \r\n \n  \t  ';
            vld.stringEmptyValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value is not defined', () => {
            let test = new TestModel();
            vld.stringEmptyValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('string_empty', nameField.name, msg.string_empty(nameField.label), vResult);
        });

        it('returns valid = false when a value is not a string', () => {
            let test = new TestModel();
            test.name = 22;
            vld.stringEmptyValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('string_empty', nameField.name, msg.string_empty(nameField.label), vResult);
        });

        it('returns valid = false for a zero-length string', () => {
            let test = new TestModel();
            test.name = '';
            vld.stringEmptyValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('string_empty', nameField.name, msg.string_empty(nameField.label), vResult);
        });

    });

    describe('numberValidator()', () => {

        it('returns valid = true when a number is specified', () => {
            let test = new TestModel();
            test.age = 12.345;
            vld.numberValidator(test, ageField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string equivalent of a number is specified', () => {
            let test = new TestModel();
            test.age = '34.567';
            vld.numberValidator(test, ageField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value is not defined', () => {
            let test = new TestModel();
            vld.numberValidator(test, ageField, meta, 'create', vResult, opts);
            expectFailure('not_a_number', ageField.name, msg.not_a_number(ageField.label), vResult);
        });

        it('returns valid = false when a value is null', () => {
            let test = new TestModel();
            test.age = null;
            vld.numberValidator(test, ageField, meta, 'create', vResult, opts);
            expectFailure('not_a_number', ageField.name, msg.not_a_number(ageField.label), vResult);
        });

        it('returns valid = false when a value is a string', () => {
            let test = new TestModel();
            test.age = 'flibble';
            vld.numberValidator(test, ageField, meta, 'create', vResult, opts);
            expectFailure('not_a_number', ageField.name, msg.not_a_number(ageField.label), vResult);
        });

        it('returns valid = false when a value is an empty string', () => {
            let test = new TestModel();
            test.age = '';
            vld.numberValidator(test, ageField, meta, 'create', vResult, opts);
            expectFailure('not_a_number', ageField.name, msg.not_a_number(ageField.label), vResult);
        });

    });

    describe('integerValidator()', () => {

        it('returns valid = true when an integer is specified', () => {
            let test = new TestModel();
            test.age = 12;
            vld.integerValidator(test, ageField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string equivalent of an integer is specified', () => {
            let test = new TestModel();
            test.age = '34';
            vld.integerValidator(test, ageField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value is not defined', () => {
            let test = new TestModel();
            vld.integerValidator(test, ageField, meta, 'create', vResult, opts);
            expectFailure('not_an_integer', ageField.name, msg.not_an_integer(ageField.label), vResult);
        });

        it('returns valid = false when a value is null', () => {
            let test = new TestModel();
            test.age = null;
            vld.integerValidator(test, ageField, meta, 'create', vResult, opts);
            expectFailure('not_an_integer', ageField.name, msg.not_an_integer(ageField.label), vResult);
        });

        it('returns valid = false when a value is a string', () => {
            let test = new TestModel();
            test.age = 'flibble';
            vld.integerValidator(test, ageField, meta, 'create', vResult, opts);
            expectFailure('not_an_integer', ageField.name, msg.not_an_integer(ageField.label), vResult);
        });

        it('returns valid = false when a value is an empty string', () => {
            let test = new TestModel();
            test.age = '';
            vld.integerValidator(test, ageField, meta, 'create', vResult, opts);
            expectFailure('not_an_integer', ageField.name, msg.not_an_integer(ageField.label), vResult);
        });

        it('returns valid = false when a value is a float', () => {
            let test = new TestModel();
            test.age = 12.345;
            vld.integerValidator(test, ageField, meta, 'create', vResult, opts);
            expectFailure('not_an_integer', ageField.name, msg.not_an_integer(ageField.label), vResult);
        });

        it('returns valid = false when value is a string representation of a float', () => {
            let test = new TestModel();
            test.age = '12.345';
            vld.integerValidator(test, ageField, meta, 'create', vResult, opts);
            expectFailure('not_an_integer', ageField.name, msg.not_an_integer(ageField.label), vResult);
        });

    });

    describe('minLengthValidator()', () => {

        // Assumes minLengh is 5

        it('returns valid = true when a string is longer than minLength', () => {
            let test = new TestModel();
            test.name = 'flibble';
            vld.minStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string is equal to minLength', () => {
            let test = new TestModel();
            test.name = 'flibb';
            vld.minStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string consists only of spaces', () => {
            let test = new TestModel();
            test.name = '        ';
            vld.minStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string contains whitespace characters', () => {
            let test = new TestModel();
            test.name = ' \r\n \t ';
            vld.minStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value is not defined', () => {
            let test = new TestModel();
            vld.minStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('min_string_length', nameField.name, msg.min_string_length(nameField.label, nameField.options.minLength), vResult);
        });

        it('returns valid = false when a value is not a string', () => {
            let test = new TestModel();
            test.name = 222222;
            vld.minStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('min_string_length', nameField.name, msg.min_string_length(nameField.label, nameField.options.minLength), vResult);
        });

        it('returns valid = false for a zero-length string', () => {
            let test = new TestModel();
            test.name = '';
            vld.minStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('min_string_length', nameField.name, msg.min_string_length(nameField.label, nameField.options.minLength), vResult);
        });

        it('returns valid = false for a short string with spaces', () => {
            let test = new TestModel();
            test.name = ' ab ';
            vld.minStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('min_string_length', nameField.name, msg.min_string_length(nameField.label, nameField.options.minLength), vResult);
        });

    });

    describe('maxLengthValidator()', () => {

        // Assumes maxLengh is 10

        it('returns valid = true when a string is shorter than maxLength', () => {
            let test = new TestModel();
            test.name = 'flibble';
            vld.maxStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string is equal to maxLength', () => {
            let test = new TestModel();
            test.name = 'flibble Ji';
            vld.maxStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string consists only of spaces', () => {
            let test = new TestModel();
            test.name = '        ';
            vld.maxStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string contains whitespace characters', () => {
            let test = new TestModel();
            test.name = ' \r\n \t ';
            vld.maxStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value is not defined', () => {
            let test = new TestModel();
            vld.maxStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('max_string_length', nameField.name, msg.max_string_length(nameField.label, nameField.options.maxLength), vResult);
        });

        it('returns valid = false when a value is not a string', () => {
            let test = new TestModel();
            test.name = 222222;
            vld.maxStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('max_string_length', nameField.name, msg.max_string_length(nameField.label, nameField.options.maxLength), vResult);
        });

        it('returns valid = false for a long string', () => {
            let test = new TestModel();
            test.name = 'dfs sfdsf erfwef dfsdf sdfsdf';
            vld.maxStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('max_string_length', nameField.name, msg.max_string_length(nameField.label, nameField.options.maxLength), vResult);
        });

        it('returns valid = false for a long string with spaces', () => {
            let test = new TestModel();
            test.name = '     ab      ';
            vld.maxStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('max_string_length', nameField.name, msg.max_string_length(nameField.label, nameField.options.maxLength), vResult);
        });

    });
});
