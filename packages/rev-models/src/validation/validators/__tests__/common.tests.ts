
import { expect } from 'chai';
import * as fld from '../../../fields';
import * as vld from '../common';
import { VALIDATION_MESSAGES as msg } from '../../validationmsg';

import { ModelValidationResult } from '../../validationresult';
import { IModelOperation } from '../../../operations/operation';
import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../../../backends/inmemory/backend';
import { expectValidationFailure } from './utils';
import { IValidationOptions } from '../../../models/types';

class TestModel {
    id: any;
    name: any;
    age: any;
    isAwesome: any;
}

let idField = new fld.IntegerField('id');
let nameField = new fld.TextField('name', {
    minLength: 5, maxLength: 10,
    minValue: 'ddd', maxValue: 'jjj',
    regEx: /^abc\d.$/  // abc[number][anything]
});
let ageField = new fld.NumberField('age', {
    minValue: 18, maxValue: 30
});
let booleanField = new fld.BooleanField('isAwesome');

let manager = new ModelManager();
manager.registerBackend('default', new InMemoryBackend());
manager.register(TestModel, {
    fields: [
        idField, nameField, ageField,
        booleanField
    ]
});

let op: IModelOperation = {
    operation: 'create'
};
let opts: IValidationOptions = {
    timeout: 200
};

describe('rev.fields.validators', () => {
    let vResult: ModelValidationResult;

    beforeEach(() => {
        vResult = new ModelValidationResult();
    });

    describe('requiredValidator()', () => {

        it('returns valid = true when a value is specified', () => {
            let test = new TestModel();
            test.name = 'flibble';
            vld.requiredValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value is not defined', () => {
            let test = new TestModel();
            vld.requiredValidator(manager, test, nameField, op, vResult, opts);
            expectValidationFailure('required', nameField.name, msg.required(nameField.name), vResult);
        });

        it('returns valid = false when a value is null', () => {
            let test = new TestModel();
            test.name = null;
            vld.requiredValidator(manager, test, nameField, op, vResult, opts);
            expectValidationFailure('required', nameField.name, msg.required(nameField.name), vResult);
        });

    });

    describe('stringValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.stringValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.name = null;
            vld.stringValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string is specified', () => {
            let test = new TestModel();
            test.name = 'flibble';
            vld.stringValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value is not a string', () => {
            let test = new TestModel();
            test.name = 22;
            vld.stringValidator(manager, test, nameField, op, vResult, opts);
            expectValidationFailure('not_a_string', nameField.name, msg.not_a_string(nameField.name), vResult);
        });

    });

    describe('stringEmptyValidator()', () => {

        it('returns valid = true when a value is not specified', () => {
            let test = new TestModel();
            vld.stringEmptyValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.name = null;
            vld.stringEmptyValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string is specified', () => {
            let test = new TestModel();
            test.name = 'flibble';
            vld.stringEmptyValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true for a string of spaces', () => {
            let test = new TestModel();
            test.name = '    ';
            vld.stringEmptyValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true for a string with other whitespace characters', () => {
            let test = new TestModel();
            test.name = '  \r\n \n  \t  ';
            vld.stringEmptyValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false for a zero-length string', () => {
            let test = new TestModel();
            test.name = '';
            vld.stringEmptyValidator(manager, test, nameField, op, vResult, opts);
            expectValidationFailure('string_empty', nameField.name, msg.string_empty(nameField.name), vResult);
        });

    });

    describe('regExValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.regExValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.name = null;
            vld.regExValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string matches the regex', () => {
            let test = new TestModel();
            test.name = 'abc12';
            vld.regExValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when another string matches the regex', () => {
            let test = new TestModel();
            test.name = 'abc2d';
            vld.regExValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value does not match the regex', () => {
            let test = new TestModel();
            test.name = 'flibble';
            vld.regExValidator(manager, test, nameField, op, vResult, opts);
            expectValidationFailure('no_regex_match', nameField.name, msg.no_regex_match(nameField.name), vResult);
        });

        it('returns valid = false when another value does not match the regex', () => {
            let test = new TestModel();
            test.name = 'abcd';
            vld.regExValidator(manager, test, nameField, op, vResult, opts);
            expectValidationFailure('no_regex_match', nameField.name, msg.no_regex_match(nameField.name), vResult);
        });

    });

    describe('numberValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.numberValidator(manager, test, ageField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.age = null;
            vld.numberValidator(manager, test, ageField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a number is specified', () => {
            let test = new TestModel();
            test.age = 12.345;
            vld.numberValidator(manager, test, ageField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string equivalent of a number is specified', () => {
            let test = new TestModel();
            test.age = '34.567';
            vld.numberValidator(manager, test, ageField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value is a string', () => {
            let test = new TestModel();
            test.age = 'flibble';
            vld.numberValidator(manager, test, ageField, op, vResult, opts);
            expectValidationFailure('not_a_number', ageField.name, msg.not_a_number(ageField.name), vResult);
        });

        it('returns valid = false when a value is an empty string', () => {
            let test = new TestModel();
            test.age = '';
            vld.numberValidator(manager, test, ageField, op, vResult, opts);
            expectValidationFailure('not_a_number', ageField.name, msg.not_a_number(ageField.name), vResult);
        });

    });

    describe('integerValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.integerValidator(manager, test, ageField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.age = null;
            vld.integerValidator(manager, test, ageField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when an integer is specified', () => {
            let test = new TestModel();
            test.age = 12;
            vld.integerValidator(manager, test, ageField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a negative integer is specified', () => {
            let test = new TestModel();
            test.age = -12;
            vld.integerValidator(manager, test, ageField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string equivalent of an integer is specified', () => {
            let test = new TestModel();
            test.age = '34';
            vld.integerValidator(manager, test, ageField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value is a string', () => {
            let test = new TestModel();
            test.age = 'flibble';
            vld.integerValidator(manager, test, ageField, op, vResult, opts);
            expectValidationFailure('not_an_integer', ageField.name, msg.not_an_integer(ageField.name), vResult);
        });

        it('returns valid = false when a value is an empty string', () => {
            let test = new TestModel();
            test.age = '';
            vld.integerValidator(manager, test, ageField, op, vResult, opts);
            expectValidationFailure('not_an_integer', ageField.name, msg.not_an_integer(ageField.name), vResult);
        });

        it('returns valid = false when a value is a float', () => {
            let test = new TestModel();
            test.age = 12.345;
            vld.integerValidator(manager, test, ageField, op, vResult, opts);
            expectValidationFailure('not_an_integer', ageField.name, msg.not_an_integer(ageField.name), vResult);
        });

        it('returns valid = false when value is a string representation of a float', () => {
            let test = new TestModel();
            test.age = '12.345';
            vld.integerValidator(manager, test, ageField, op, vResult, opts);
            expectValidationFailure('not_an_integer', ageField.name, msg.not_an_integer(ageField.name), vResult);
        });

    });

    describe('booleanValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.integerValidator(manager, test, booleanField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.isAwesome = null;
            vld.integerValidator(manager, test, booleanField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a boolean is specified and true', () => {
            let test = new TestModel();
            test.isAwesome = true;
            vld.booleanValidator(manager, test, booleanField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a boolean is specified and false', () => {
            let test = new TestModel();
            test.isAwesome = false;
            vld.booleanValidator(manager, test, booleanField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value is not a boolean', () => {
            let test = new TestModel();
            test.isAwesome = 22;
            vld.booleanValidator(manager, test, booleanField, op, vResult, opts);
            expectValidationFailure('not_a_boolean', booleanField.name, msg.not_a_boolean(booleanField.name), vResult);
        });

    });

    describe('minLengthValidator()', () => {

        // Assumes minLengh is 5

        it('returns valid = true when a string is longer than minLength', () => {
            let test = new TestModel();
            test.name = 'flibble';
            vld.minStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string is equal to minLength', () => {
            let test = new TestModel();
            test.name = 'flibb';
            vld.minStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string consists only of spaces', () => {
            let test = new TestModel();
            test.name = '        ';
            vld.minStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string contains whitespace characters', () => {
            let test = new TestModel();
            test.name = ' \r\n \t ';
            vld.minStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true (validation bypassed) when a value is not defined', () => {
            let test = new TestModel();
            vld.minStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true (validation bypassed) when a value is not a string', () => {
            let test = new TestModel();
            test.name = 222222;
            vld.minStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false for a zero-length string', () => {
            let test = new TestModel();
            test.name = '';
            vld.minStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expectValidationFailure('min_string_length', nameField.name, msg.min_string_length(nameField.name, nameField.options.minLength), vResult);
        });

        it('returns valid = false for a short string with spaces', () => {
            let test = new TestModel();
            test.name = ' ab ';
            vld.minStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expectValidationFailure('min_string_length', nameField.name, msg.min_string_length(nameField.name, nameField.options.minLength), vResult);
        });

    });

    describe('maxLengthValidator()', () => {

        // Assumes maxLengh is 10

        it('returns valid = true when a string is shorter than maxLength', () => {
            let test = new TestModel();
            test.name = 'flibble';
            vld.maxStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string is equal to maxLength', () => {
            let test = new TestModel();
            test.name = 'flibble Ji';
            vld.maxStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string consists only of spaces', () => {
            let test = new TestModel();
            test.name = '        ';
            vld.maxStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string contains whitespace characters', () => {
            let test = new TestModel();
            test.name = ' \r\n \t ';
            vld.maxStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true (validation bypassed) when a value is not defined', () => {
            let test = new TestModel();
            vld.maxStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true (validation bypassed) when a value is not a string', () => {
            let test = new TestModel();
            test.name = 222222;
            vld.maxStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false for a long string', () => {
            let test = new TestModel();
            test.name = 'dfs sfdsf erfwef dfsdf sdfsdf';
            vld.maxStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expectValidationFailure('max_string_length', nameField.name, msg.max_string_length(nameField.name, nameField.options.maxLength), vResult);
        });

        it('returns valid = false for a long string with spaces', () => {
            let test = new TestModel();
            test.name = '     ab      ';
            vld.maxStringLengthValidator(manager, test, nameField, op, vResult, opts);
            expectValidationFailure('max_string_length', nameField.name, msg.max_string_length(nameField.name, nameField.options.maxLength), vResult);
        });

    });

    describe('minValueValidator()', () => {

        // Assume name minValue = 'ddd', age minValue = 18
        // JavaScript orders strings in alphabetical order

        it('returns valid = true when a number is greater than minValue', () => {
            let test = new TestModel();
            test.age = 25;
            vld.minValueValidator(manager, test, ageField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a number is equal to minValue', () => {
            let test = new TestModel();
            test.age = 18;
            vld.minValueValidator(manager, test, ageField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string is greater than minValue', () => {
            let test = new TestModel();
            test.name = 'f';
            vld.minValueValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string is equal to minValue', () => {
            let test = new TestModel();
            test.name = 'ddd';
            vld.minValueValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true (validation bypassed) when a value is not defined', () => {
            let test = new TestModel();
            vld.minValueValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true (validation bypassed) when a value is null', () => {
            let test = new TestModel();
            test.name = null;
            vld.minValueValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when number is less than minValue', () => {
            let test = new TestModel();
            test.age = 10;
            vld.minValueValidator(manager, test, ageField, op, vResult, opts);
            expectValidationFailure('min_value', ageField.name, msg.min_value(ageField.name, ageField.options.minValue), vResult);
        });

        it('returns valid = false when number is a lot less than minValue', () => {
            let test = new TestModel();
            test.age = -120;
            vld.minValueValidator(manager, test, ageField, op, vResult, opts);
            expectValidationFailure('min_value', ageField.name, msg.min_value(ageField.name, ageField.options.minValue), vResult);
        });

        it('returns valid = false when string is less than minValue', () => {
            let test = new TestModel();
            test.name = 'bbb';
            vld.minValueValidator(manager, test, nameField, op, vResult, opts);
            expectValidationFailure('min_value', nameField.name, msg.min_value(nameField.name, nameField.options.minValue), vResult);
        });

        it('returns valid = false when string is a lot less than minValue', () => {
            let test = new TestModel();
            test.name = '';
            vld.minValueValidator(manager, test, nameField, op, vResult, opts);
            expectValidationFailure('min_value', nameField.name, msg.min_value(nameField.name, nameField.options.minValue), vResult);
        });

    });

    describe('maxValueValidator()', () => {

        // Assume name maxValue = 'jjj', age maxValue = 30
        // JavaScript orders strings in alphabetical order

        it('returns valid = true when a number is less than maxValue', () => {
            let test = new TestModel();
            test.age = 22;
            vld.maxValueValidator(manager, test, ageField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a number is equal to maxValue', () => {
            let test = new TestModel();
            test.age = 30;
            vld.maxValueValidator(manager, test, ageField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string is less than maxValue', () => {
            let test = new TestModel();
            test.name = 'b';
            vld.maxValueValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a string is equal to maxValue', () => {
            let test = new TestModel();
            test.name = 'jjj';
            vld.maxValueValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true (validation bypassed) when a value is not defined', () => {
            let test = new TestModel();
            vld.maxValueValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true (validation bypassed) when a value is null', () => {
            let test = new TestModel();
            test.name = null;
            vld.maxValueValidator(manager, test, nameField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when number is greater than maxValue', () => {
            let test = new TestModel();
            test.age = 45;
            vld.maxValueValidator(manager, test, ageField, op, vResult, opts);
            expectValidationFailure('max_value', ageField.name, msg.max_value(ageField.name, ageField.options.maxValue), vResult);
        });

        it('returns valid = false when string is greater than maxValue', () => {
            let test = new TestModel();
            test.name = 'zzz';
            vld.maxValueValidator(manager, test, nameField, op, vResult, opts);
            expectValidationFailure('max_value', nameField.name, msg.max_value(nameField.name, nameField.options.maxValue), vResult);
        });

    });

});
