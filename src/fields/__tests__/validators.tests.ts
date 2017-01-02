import { IFieldOptions, IValidationOptions, NumberField, DateField } from '../index';
import { IModelMeta } from '../../model/index';
import { expect } from 'chai';
import * as fld from '../index';
import * as vld from '../validators';
import { VALIDATION_MESSAGES as msg } from '../validationmsg';

import { ModelValidationResult } from '../../model/validationresult';

class TestModel {
    id: any;
    name: any;
    age: any;
    gender: any;
    hobbies: any;
    isAwesome: any;
    registered: any;
}
let nameField = new fld.TextField('name', 'Name', {
    minLength: 5, maxLength: 10,
    minValue: 'ddd', maxValue: 'jjj',
    regEx: /^abc\d.$/  // abc[number][anything]
});
let idField = new fld.IntegerField('id', 'Id');
let ageField = new fld.NumberField('age', 'Age', {
    minValue: 18, maxValue: 30
});
let genderField = new fld.SelectionField('gender', 'Gender', [
    ['male', 'Male'],
    ['female', 'Female']
]);
let hobbiesField = new fld.SelectionField('hobbies', 'Hobbies', [
    ['ironing', 'Ironing'],
    ['extreme_ironing', 'Extreme Ironing'],
    ['naked_ironing', 'Naked Ironing']
], { multiple: true });
let booleanField = new fld.BooleanField('isAwesome', 'Is Awesome?');
let dateField = new fld.DateTimeField('registered', 'Date Registered');

let meta: IModelMeta<TestModel> = {
    fields: [
        idField, nameField, ageField, genderField,
        booleanField, dateField
    ]
};
let opts: IValidationOptions = {
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

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.stringValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.name = null;
            vld.stringValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string is specified', () => {
            let test = new TestModel();
            test.name = 'flibble';
            vld.stringValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
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

        it('returns valid = false when a value is null', () => {
            let test = new TestModel();
            test.name = null;
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

    describe('regExValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.regExValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.name = null;
            vld.regExValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string matches the regex', () => {
            let test = new TestModel();
            test.name = 'abc12';
            vld.regExValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when another string matches the regex', () => {
            let test = new TestModel();
            test.name = 'abc2d';
            vld.regExValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value does not match the regex', () => {
            let test = new TestModel();
            test.name = 'flibble';
            vld.regExValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('no_regex_match', nameField.name, msg.no_regex_match(nameField.label), vResult);
        });

        it('returns valid = false when another value does not match the regex', () => {
            let test = new TestModel();
            test.name = 'abcd';
            vld.regExValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('no_regex_match', nameField.name, msg.no_regex_match(nameField.label), vResult);
        });

    });

    describe('numberValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.numberValidator(test, ageField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.age = null;
            vld.numberValidator(test, ageField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

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

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.integerValidator(test, ageField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.age = null;
            vld.integerValidator(test, ageField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when an integer is specified', () => {
            let test = new TestModel();
            test.age = 12;
            vld.integerValidator(test, ageField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a negative integer is specified', () => {
            let test = new TestModel();
            test.age = -12;
            vld.integerValidator(test, ageField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string equivalent of an integer is specified', () => {
            let test = new TestModel();
            test.age = '34';
            vld.integerValidator(test, ageField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
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

    describe('booleanValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.integerValidator(test, booleanField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.isAwesome = null;
            vld.integerValidator(test, booleanField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a boolean is specified and true', () => {
            let test = new TestModel();
            test.isAwesome = true;
            vld.booleanValidator(test, booleanField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a boolean is specified and false', () => {
            let test = new TestModel();
            test.isAwesome = false;
            vld.booleanValidator(test, booleanField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value is not a boolean', () => {
            let test = new TestModel();
            test.isAwesome = 22;
            vld.booleanValidator(test, booleanField, meta, 'create', vResult, opts);
            expectFailure('not_a_boolean', booleanField.name, msg.not_a_boolean(booleanField.label), vResult);
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

        it('returns valid = true (validation bypassed) when a value is not defined', () => {
            let test = new TestModel();
            vld.minStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true (validation bypassed) when a value is not a string', () => {
            let test = new TestModel();
            test.name = 222222;
            vld.minStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
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

        it('returns valid = true (validation bypassed) when a value is not defined', () => {
            let test = new TestModel();
            vld.maxStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true (validation bypassed) when a value is not a string', () => {
            let test = new TestModel();
            test.name = 222222;
            vld.maxStringLengthValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
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

    describe('minValueValidator()', () => {

        // Assume name minValue = 'ddd', age minValue = 18
        // JavaScript orders strings in alphabetical order

        it('returns valid = true when a number is greater than minValue', () => {
            let test = new TestModel();
            test.age = 25;
            vld.minValueValidator(test, ageField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a number is equal to minValue', () => {
            let test = new TestModel();
            test.age = 18;
            vld.minValueValidator(test, ageField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string is greater than minValue', () => {
            let test = new TestModel();
            test.name = 'f';
            vld.minValueValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string is equal to minValue', () => {
            let test = new TestModel();
            test.name = 'ddd';
            vld.minValueValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true (validation bypassed) when a value is not defined', () => {
            let test = new TestModel();
            vld.minValueValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true (validation bypassed) when a value is null', () => {
            let test = new TestModel();
            test.name = null;
            vld.minValueValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when number is less than minValue', () => {
            let test = new TestModel();
            test.age = 10;
            vld.minValueValidator(test, ageField, meta, 'create', vResult, opts);
            expectFailure('min_value', ageField.name, msg.min_value(ageField.label, ageField.options.minValue), vResult);
        });

        it('returns valid = false when number is a lot less than minValue', () => {
            let test = new TestModel();
            test.age = -120;
            vld.minValueValidator(test, ageField, meta, 'create', vResult, opts);
            expectFailure('min_value', ageField.name, msg.min_value(ageField.label, ageField.options.minValue), vResult);
        });

        it('returns valid = false when string is less than minValue', () => {
            let test = new TestModel();
            test.name = 'bbb';
            vld.minValueValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('min_value', nameField.name, msg.min_value(nameField.label, nameField.options.minValue), vResult);
        });

        it('returns valid = false when string is a lot less than minValue', () => {
            let test = new TestModel();
            test.name = '';
            vld.minValueValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('min_value', nameField.name, msg.min_value(nameField.label, nameField.options.minValue), vResult);
        });

    });

    describe('maxValueValidator()', () => {

        // Assume name maxValue = 'jjj', age maxValue = 30
        // JavaScript orders strings in alphabetical order

        it('returns valid = true when a number is less than maxValue', () => {
            let test = new TestModel();
            test.age = 22;
            vld.maxValueValidator(test, ageField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a number is equal to maxValue', () => {
            let test = new TestModel();
            test.age = 30;
            vld.maxValueValidator(test, ageField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string is less than maxValue', () => {
            let test = new TestModel();
            test.name = 'b';
            vld.maxValueValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string is equal to maxValue', () => {
            let test = new TestModel();
            test.name = 'jjj';
            vld.maxValueValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true (validation bypassed) when a value is not defined', () => {
            let test = new TestModel();
            vld.maxValueValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true (validation bypassed) when a value is null', () => {
            let test = new TestModel();
            test.name = null;
            vld.maxValueValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when number is greater than maxValue', () => {
            let test = new TestModel();
            test.age = 45;
            vld.maxValueValidator(test, ageField, meta, 'create', vResult, opts);
            expectFailure('max_value', ageField.name, msg.max_value(ageField.label, ageField.options.maxValue), vResult);
        });

        it('returns valid = false when string is greater than maxValue', () => {
            let test = new TestModel();
            test.name = 'zzz';
            vld.maxValueValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('max_value', nameField.name, msg.max_value(nameField.label, nameField.options.maxValue), vResult);
        });

    });

    describe('singleSelectionValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.singleSelectionValidator(test, genderField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.gender = null;
            vld.singleSelectionValidator(test, genderField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when the value is in the selection', () => {
            let test = new TestModel();
            test.gender = 'female';
            vld.singleSelectionValidator(test, genderField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when the value is not in the selection', () => {
            let test = new TestModel();
            test.gender = 'hamster';
            vld.singleSelectionValidator(test, genderField, meta, 'create', vResult, opts);
            expectFailure('no_selection_match', genderField.name, msg.no_selection_match(genderField.label), vResult);
        });

        it('returns valid = false when the value is a number that is not in the selection', () => {
            let test = new TestModel();
            test.gender = 222;
            vld.singleSelectionValidator(test, genderField, meta, 'create', vResult, opts);
            expectFailure('no_selection_match', genderField.name, msg.no_selection_match(genderField.label), vResult);
        });

        it('returns valid = false when value is an empty string', () => {
            let test = new TestModel();
            test.gender = '';
            vld.singleSelectionValidator(test, genderField, meta, 'create', vResult, opts);
            expectFailure('no_selection_match', genderField.name, msg.no_selection_match(genderField.label), vResult);
        });

    });

    describe('multipleSelectionValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.multipleSelectionValidator(test, hobbiesField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.hobbies = null;
            vld.multipleSelectionValidator(test, hobbiesField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when one value is in the selection', () => {
            let test = new TestModel();
            test.hobbies = ['ironing'];
            vld.multipleSelectionValidator(test, hobbiesField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when more than one value is in the selection', () => {
            let test = new TestModel();
            test.hobbies = ['ironing', 'extreme_ironing'];
            vld.multipleSelectionValidator(test, hobbiesField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when value is just a string', () => {
            let test = new TestModel();
            test.hobbies = 'ironing';
            vld.multipleSelectionValidator(test, hobbiesField, meta, 'create', vResult, opts);
            expectFailure('selection_not_an_array', hobbiesField.name, msg.selection_not_an_array(hobbiesField.label), vResult);
        });

        it('returns valid = false when value is just a number', () => {
            let test = new TestModel();
            test.hobbies = 222;
            vld.multipleSelectionValidator(test, hobbiesField, meta, 'create', vResult, opts);
            expectFailure('selection_not_an_array', hobbiesField.name, msg.selection_not_an_array(hobbiesField.label), vResult);
        });

        it('returns valid = false when value is an object', () => {
            let test = new TestModel();
            test.hobbies = { flibble: true };
            vld.multipleSelectionValidator(test, hobbiesField, meta, 'create', vResult, opts);
            expectFailure('selection_not_an_array', hobbiesField.name, msg.selection_not_an_array(hobbiesField.label), vResult);
        });

        it('returns valid = false when one value is not in the selection', () => {
            let test = new TestModel();
            test.hobbies = ['golf'];
            vld.multipleSelectionValidator(test, hobbiesField, meta, 'create', vResult, opts);
            expectFailure('no_selection_match', hobbiesField.name, msg.no_selection_match(hobbiesField.label), vResult);
        });

        it('returns valid = false when one value is in the selection and one is not in the selection', () => {
            let test = new TestModel();
            test.hobbies = ['ironing', 'golf'];
            vld.multipleSelectionValidator(test, hobbiesField, meta, 'create', vResult, opts);
            expectFailure('no_selection_match', hobbiesField.name, msg.no_selection_match(hobbiesField.label), vResult);
        });

        it('returns valid = false when one value is a number that is not in the selection', () => {
            let test = new TestModel();
            test.hobbies = [222];
            vld.multipleSelectionValidator(test, hobbiesField, meta, 'create', vResult, opts);
            expectFailure('no_selection_match', hobbiesField.name, msg.no_selection_match(hobbiesField.label), vResult);
        });

        it('returns valid = false when value is an empty string', () => {
            let test = new TestModel();
            test.hobbies = [''];
            vld.multipleSelectionValidator(test, hobbiesField, meta, 'create', vResult, opts);
            expectFailure('no_selection_match', hobbiesField.name, msg.no_selection_match(hobbiesField.label), vResult);
        });

    });

    describe('dateOnlyValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.dateOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.registered = null;
            vld.dateOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a date object is passed', () => {
            let test = new TestModel();
            test.registered = new Date('2016-12-01');
            vld.dateOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a date in the correct format is passed', () => {
            let test = new TestModel();
            test.registered = '2016-12-01';
            vld.dateOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a non-date object is set', () => {
            let test = new TestModel();
            test.registered = new TestModel();
            vld.dateOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_date', dateField.name, msg.not_a_date(dateField.label), vResult);
        });

        it('returns valid = false when date string also contains a time', () => {
            let test = new TestModel();
            test.registered = '2016-12-01T12:00:00';
            vld.dateOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_date', dateField.name, msg.not_a_date(dateField.label), vResult);
        });

        it('returns valid = false when date string is an invalid date', () => {
            let test = new TestModel();
            test.registered = '2016-00-12';
            vld.dateOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_date', dateField.name, msg.not_a_date(dateField.label), vResult);
        });

        it('returns valid = false when string is not in the correct format', () => {
            let test = new TestModel();
            test.registered = '17 May 1985';
            vld.dateOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_date', dateField.name, msg.not_a_date(dateField.label), vResult);
        });

        it('returns valid = false when string is empty', () => {
            let test = new TestModel();
            test.registered = '';
            vld.dateOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_date', dateField.name, msg.not_a_date(dateField.label), vResult);
        });

    });

    describe('timeOnlyValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.timeOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.registered = null;
            vld.timeOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a date object is passed', () => {
            let test = new TestModel();
            test.registered = new Date('2016-12-01T12:11:01');
            vld.timeOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a time in the correct format is passed', () => {
            let test = new TestModel();
            test.registered = '15:11:01';
            vld.timeOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a non-date object is set', () => {
            let test = new TestModel();
            test.registered = new TestModel();
            vld.timeOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_time', dateField.name, msg.not_a_time(dateField.label), vResult);
        });

        it('returns valid = false when time string also contains a date', () => {
            let test = new TestModel();
            test.registered = '2016-12-01T15:11:01';
            vld.timeOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_time', dateField.name, msg.not_a_time(dateField.label), vResult);
        });

        it('returns valid = false when time string is an invalid time', () => {
            let test = new TestModel();
            test.registered = '56:21:32';
            vld.timeOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_time', dateField.name, msg.not_a_time(dateField.label), vResult);
        });

        it('returns valid = false when string is not in the correct format', () => {
            let test = new TestModel();
            test.registered = '5:21 pm';
            vld.timeOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_time', dateField.name, msg.not_a_time(dateField.label), vResult);
        });

        it('returns valid = false when string is empty', () => {
            let test = new TestModel();
            test.registered = '';
            vld.timeOnlyValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_time', dateField.name, msg.not_a_time(dateField.label), vResult);
        });

    });

    describe('dateTimeValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.dateTimeValidator(test, dateField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.registered = null;
            vld.dateTimeValidator(test, dateField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a date object is passed', () => {
            let test = new TestModel();
            test.registered = new Date('2016-12-01T12:22:33');
            vld.dateTimeValidator(test, dateField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a datetime in the correct format is passed', () => {
            let test = new TestModel();
            test.registered = '2016-12-01T12:22:33';
            vld.dateTimeValidator(test, dateField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a non-date object is set', () => {
            let test = new TestModel();
            test.registered = new TestModel();
            vld.dateTimeValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_datetime', dateField.name, msg.not_a_datetime(dateField.label), vResult);
        });

        it('returns valid = false when datetime string does not contain a time', () => {
            let test = new TestModel();
            test.registered = '2016-12-01';
            vld.dateTimeValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_datetime', dateField.name, msg.not_a_datetime(dateField.label), vResult);
        });

        it('returns valid = false when datetime string has an invalid date', () => {
            let test = new TestModel();
            test.registered = '2016-00-12T12:22:33';
            vld.dateTimeValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_datetime', dateField.name, msg.not_a_datetime(dateField.label), vResult);
        });

        it('returns valid = false when datetime string has an invalid time', () => {
            let test = new TestModel();
            test.registered = '2016-01-12T25:22:33';
            vld.dateTimeValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_datetime', dateField.name, msg.not_a_datetime(dateField.label), vResult);
        });

        it('returns valid = false when datetime string contains milliseconds and TZ', () => {
            let test = new TestModel();
            test.registered = '2016-01-12T11:22:33.000Z';
            vld.dateTimeValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_datetime', dateField.name, msg.not_a_datetime(dateField.label), vResult);
        });

        it('returns valid = false when string is not in the correct format', () => {
            let test = new TestModel();
            test.registered = '17 May 1985 11:22:33';
            vld.dateTimeValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_datetime', dateField.name, msg.not_a_datetime(dateField.label), vResult);
        });

        it('returns valid = false when string is empty', () => {
            let test = new TestModel();
            test.registered = '';
            vld.dateTimeValidator(test, dateField, meta, 'create', vResult, opts);
            expectFailure('not_a_datetime', dateField.name, msg.not_a_datetime(dateField.label), vResult);
        });

    });

});
