"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var fld = require("../index");
var vld = require("../validators");
var validationmsg_1 = require("../validationmsg");
var validation_1 = require("../../models/validation");
var TestModel = (function () {
    function TestModel() {
    }
    return TestModel;
}());
var nameField = new fld.TextField('name', 'Name', {
    minLength: 5, maxLength: 10,
    minValue: 'ddd', maxValue: 'jjj',
    regEx: /^abc\d.$/ // abc[number][anything]
});
var idField = new fld.IntegerField('id', 'Id');
var ageField = new fld.NumberField('age', 'Age', {
    minValue: 18, maxValue: 30
});
var genderField = new fld.SelectionField('gender', 'Gender', [
    ['male', 'Male'],
    ['female', 'Female']
]);
var hobbiesField = new fld.SelectionField('hobbies', 'Hobbies', [
    ['ironing', 'Ironing'],
    ['extreme_ironing', 'Extreme Ironing'],
    ['naked_ironing', 'Naked Ironing']
], { multiple: true });
var booleanField = new fld.BooleanField('isAwesome', 'Is Awesome?');
var dateField = new fld.DateTimeField('registered', 'Date Registered');
var op = {
    type: 'create'
};
var meta = {
    fields: [
        idField, nameField, ageField, genderField,
        booleanField, dateField
    ]
};
var opts = {
    timeout: 200
};
function expectFailure(validatorName, fieldName, message, vResult) {
    chai_1.expect(vResult.valid).to.equal(false);
    chai_1.expect(vResult.fieldErrors[fieldName].length).to.equal(1);
    chai_1.expect(vResult.fieldErrors[fieldName][0]).to.deep.equal({
        message: message,
        code: validatorName
    });
}
describe('rev.fields.validators', function () {
    var vResult;
    beforeEach(function () {
        vResult = new validation_1.ModelValidationResult();
    });
    describe('requiredValidator()', function () {
        it('returns valid = true when a value is specified', function () {
            var test = new TestModel();
            test.name = 'flibble';
            vld.requiredValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false when a value is not defined', function () {
            var test = new TestModel();
            vld.requiredValidator(test, nameField, meta, op, vResult, opts);
            expectFailure('required', nameField.name, validationmsg_1.VALIDATION_MESSAGES.required(nameField.label), vResult);
        });
        it('returns valid = false when a value is null', function () {
            var test = new TestModel();
            test.name = null;
            vld.requiredValidator(test, nameField, meta, op, vResult, opts);
            expectFailure('required', nameField.name, validationmsg_1.VALIDATION_MESSAGES.required(nameField.label), vResult);
        });
    });
    describe('stringValidator()', function () {
        it('returns valid = true when a value is not defined', function () {
            var test = new TestModel();
            vld.stringValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a value is null', function () {
            var test = new TestModel();
            test.name = null;
            vld.stringValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a string is specified', function () {
            var test = new TestModel();
            test.name = 'flibble';
            vld.stringValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false when a value is not a string', function () {
            var test = new TestModel();
            test.name = 22;
            vld.stringValidator(test, nameField, meta, op, vResult, opts);
            expectFailure('not_a_string', nameField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_string(nameField.label), vResult);
        });
    });
    describe('stringEmptyValidator()', function () {
        it('returns valid = true when a value is not specified', function () {
            var test = new TestModel();
            vld.stringEmptyValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a value is null', function () {
            var test = new TestModel();
            test.name = null;
            vld.stringEmptyValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a string is specified', function () {
            var test = new TestModel();
            test.name = 'flibble';
            vld.stringEmptyValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true for a string of spaces', function () {
            var test = new TestModel();
            test.name = '    ';
            vld.stringEmptyValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true for a string with other whitespace characters', function () {
            var test = new TestModel();
            test.name = '  \r\n \n  \t  ';
            vld.stringEmptyValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false for a zero-length string', function () {
            var test = new TestModel();
            test.name = '';
            vld.stringEmptyValidator(test, nameField, meta, op, vResult, opts);
            expectFailure('string_empty', nameField.name, validationmsg_1.VALIDATION_MESSAGES.string_empty(nameField.label), vResult);
        });
    });
    describe('regExValidator()', function () {
        it('returns valid = true when a value is not defined', function () {
            var test = new TestModel();
            vld.regExValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a value is null', function () {
            var test = new TestModel();
            test.name = null;
            vld.regExValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a string matches the regex', function () {
            var test = new TestModel();
            test.name = 'abc12';
            vld.regExValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when another string matches the regex', function () {
            var test = new TestModel();
            test.name = 'abc2d';
            vld.regExValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false when a value does not match the regex', function () {
            var test = new TestModel();
            test.name = 'flibble';
            vld.regExValidator(test, nameField, meta, op, vResult, opts);
            expectFailure('no_regex_match', nameField.name, validationmsg_1.VALIDATION_MESSAGES.no_regex_match(nameField.label), vResult);
        });
        it('returns valid = false when another value does not match the regex', function () {
            var test = new TestModel();
            test.name = 'abcd';
            vld.regExValidator(test, nameField, meta, op, vResult, opts);
            expectFailure('no_regex_match', nameField.name, validationmsg_1.VALIDATION_MESSAGES.no_regex_match(nameField.label), vResult);
        });
    });
    describe('numberValidator()', function () {
        it('returns valid = true when a value is not defined', function () {
            var test = new TestModel();
            vld.numberValidator(test, ageField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a value is null', function () {
            var test = new TestModel();
            test.age = null;
            vld.numberValidator(test, ageField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a number is specified', function () {
            var test = new TestModel();
            test.age = 12.345;
            vld.numberValidator(test, ageField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a string equivalent of a number is specified', function () {
            var test = new TestModel();
            test.age = '34.567';
            vld.numberValidator(test, ageField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false when a value is a string', function () {
            var test = new TestModel();
            test.age = 'flibble';
            vld.numberValidator(test, ageField, meta, op, vResult, opts);
            expectFailure('not_a_number', ageField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_number(ageField.label), vResult);
        });
        it('returns valid = false when a value is an empty string', function () {
            var test = new TestModel();
            test.age = '';
            vld.numberValidator(test, ageField, meta, op, vResult, opts);
            expectFailure('not_a_number', ageField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_number(ageField.label), vResult);
        });
    });
    describe('integerValidator()', function () {
        it('returns valid = true when a value is not defined', function () {
            var test = new TestModel();
            vld.integerValidator(test, ageField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a value is null', function () {
            var test = new TestModel();
            test.age = null;
            vld.integerValidator(test, ageField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when an integer is specified', function () {
            var test = new TestModel();
            test.age = 12;
            vld.integerValidator(test, ageField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a negative integer is specified', function () {
            var test = new TestModel();
            test.age = -12;
            vld.integerValidator(test, ageField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a string equivalent of an integer is specified', function () {
            var test = new TestModel();
            test.age = '34';
            vld.integerValidator(test, ageField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false when a value is a string', function () {
            var test = new TestModel();
            test.age = 'flibble';
            vld.integerValidator(test, ageField, meta, op, vResult, opts);
            expectFailure('not_an_integer', ageField.name, validationmsg_1.VALIDATION_MESSAGES.not_an_integer(ageField.label), vResult);
        });
        it('returns valid = false when a value is an empty string', function () {
            var test = new TestModel();
            test.age = '';
            vld.integerValidator(test, ageField, meta, op, vResult, opts);
            expectFailure('not_an_integer', ageField.name, validationmsg_1.VALIDATION_MESSAGES.not_an_integer(ageField.label), vResult);
        });
        it('returns valid = false when a value is a float', function () {
            var test = new TestModel();
            test.age = 12.345;
            vld.integerValidator(test, ageField, meta, op, vResult, opts);
            expectFailure('not_an_integer', ageField.name, validationmsg_1.VALIDATION_MESSAGES.not_an_integer(ageField.label), vResult);
        });
        it('returns valid = false when value is a string representation of a float', function () {
            var test = new TestModel();
            test.age = '12.345';
            vld.integerValidator(test, ageField, meta, op, vResult, opts);
            expectFailure('not_an_integer', ageField.name, validationmsg_1.VALIDATION_MESSAGES.not_an_integer(ageField.label), vResult);
        });
    });
    describe('booleanValidator()', function () {
        it('returns valid = true when a value is not defined', function () {
            var test = new TestModel();
            vld.integerValidator(test, booleanField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a value is null', function () {
            var test = new TestModel();
            test.isAwesome = null;
            vld.integerValidator(test, booleanField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a boolean is specified and true', function () {
            var test = new TestModel();
            test.isAwesome = true;
            vld.booleanValidator(test, booleanField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a boolean is specified and false', function () {
            var test = new TestModel();
            test.isAwesome = false;
            vld.booleanValidator(test, booleanField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false when a value is not a boolean', function () {
            var test = new TestModel();
            test.isAwesome = 22;
            vld.booleanValidator(test, booleanField, meta, op, vResult, opts);
            expectFailure('not_a_boolean', booleanField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_boolean(booleanField.label), vResult);
        });
    });
    describe('minLengthValidator()', function () {
        // Assumes minLengh is 5
        it('returns valid = true when a string is longer than minLength', function () {
            var test = new TestModel();
            test.name = 'flibble';
            vld.minStringLengthValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a string is equal to minLength', function () {
            var test = new TestModel();
            test.name = 'flibb';
            vld.minStringLengthValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a string consists only of spaces', function () {
            var test = new TestModel();
            test.name = '        ';
            vld.minStringLengthValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a string contains whitespace characters', function () {
            var test = new TestModel();
            test.name = ' \r\n \t ';
            vld.minStringLengthValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true (validation bypassed) when a value is not defined', function () {
            var test = new TestModel();
            vld.minStringLengthValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true (validation bypassed) when a value is not a string', function () {
            var test = new TestModel();
            test.name = 222222;
            vld.minStringLengthValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false for a zero-length string', function () {
            var test = new TestModel();
            test.name = '';
            vld.minStringLengthValidator(test, nameField, meta, op, vResult, opts);
            expectFailure('min_string_length', nameField.name, validationmsg_1.VALIDATION_MESSAGES.min_string_length(nameField.label, nameField.options.minLength), vResult);
        });
        it('returns valid = false for a short string with spaces', function () {
            var test = new TestModel();
            test.name = ' ab ';
            vld.minStringLengthValidator(test, nameField, meta, op, vResult, opts);
            expectFailure('min_string_length', nameField.name, validationmsg_1.VALIDATION_MESSAGES.min_string_length(nameField.label, nameField.options.minLength), vResult);
        });
    });
    describe('maxLengthValidator()', function () {
        // Assumes maxLengh is 10
        it('returns valid = true when a string is shorter than maxLength', function () {
            var test = new TestModel();
            test.name = 'flibble';
            vld.maxStringLengthValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a string is equal to maxLength', function () {
            var test = new TestModel();
            test.name = 'flibble Ji';
            vld.maxStringLengthValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a string consists only of spaces', function () {
            var test = new TestModel();
            test.name = '        ';
            vld.maxStringLengthValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a string contains whitespace characters', function () {
            var test = new TestModel();
            test.name = ' \r\n \t ';
            vld.maxStringLengthValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true (validation bypassed) when a value is not defined', function () {
            var test = new TestModel();
            vld.maxStringLengthValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true (validation bypassed) when a value is not a string', function () {
            var test = new TestModel();
            test.name = 222222;
            vld.maxStringLengthValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false for a long string', function () {
            var test = new TestModel();
            test.name = 'dfs sfdsf erfwef dfsdf sdfsdf';
            vld.maxStringLengthValidator(test, nameField, meta, op, vResult, opts);
            expectFailure('max_string_length', nameField.name, validationmsg_1.VALIDATION_MESSAGES.max_string_length(nameField.label, nameField.options.maxLength), vResult);
        });
        it('returns valid = false for a long string with spaces', function () {
            var test = new TestModel();
            test.name = '     ab      ';
            vld.maxStringLengthValidator(test, nameField, meta, op, vResult, opts);
            expectFailure('max_string_length', nameField.name, validationmsg_1.VALIDATION_MESSAGES.max_string_length(nameField.label, nameField.options.maxLength), vResult);
        });
    });
    describe('minValueValidator()', function () {
        // Assume name minValue = 'ddd', age minValue = 18
        // JavaScript orders strings in alphabetical order
        it('returns valid = true when a number is greater than minValue', function () {
            var test = new TestModel();
            test.age = 25;
            vld.minValueValidator(test, ageField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a number is equal to minValue', function () {
            var test = new TestModel();
            test.age = 18;
            vld.minValueValidator(test, ageField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a string is greater than minValue', function () {
            var test = new TestModel();
            test.name = 'f';
            vld.minValueValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a string is equal to minValue', function () {
            var test = new TestModel();
            test.name = 'ddd';
            vld.minValueValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true (validation bypassed) when a value is not defined', function () {
            var test = new TestModel();
            vld.minValueValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true (validation bypassed) when a value is null', function () {
            var test = new TestModel();
            test.name = null;
            vld.minValueValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false when number is less than minValue', function () {
            var test = new TestModel();
            test.age = 10;
            vld.minValueValidator(test, ageField, meta, op, vResult, opts);
            expectFailure('min_value', ageField.name, validationmsg_1.VALIDATION_MESSAGES.min_value(ageField.label, ageField.options.minValue), vResult);
        });
        it('returns valid = false when number is a lot less than minValue', function () {
            var test = new TestModel();
            test.age = -120;
            vld.minValueValidator(test, ageField, meta, op, vResult, opts);
            expectFailure('min_value', ageField.name, validationmsg_1.VALIDATION_MESSAGES.min_value(ageField.label, ageField.options.minValue), vResult);
        });
        it('returns valid = false when string is less than minValue', function () {
            var test = new TestModel();
            test.name = 'bbb';
            vld.minValueValidator(test, nameField, meta, op, vResult, opts);
            expectFailure('min_value', nameField.name, validationmsg_1.VALIDATION_MESSAGES.min_value(nameField.label, nameField.options.minValue), vResult);
        });
        it('returns valid = false when string is a lot less than minValue', function () {
            var test = new TestModel();
            test.name = '';
            vld.minValueValidator(test, nameField, meta, op, vResult, opts);
            expectFailure('min_value', nameField.name, validationmsg_1.VALIDATION_MESSAGES.min_value(nameField.label, nameField.options.minValue), vResult);
        });
    });
    describe('maxValueValidator()', function () {
        // Assume name maxValue = 'jjj', age maxValue = 30
        // JavaScript orders strings in alphabetical order
        it('returns valid = true when a number is less than maxValue', function () {
            var test = new TestModel();
            test.age = 22;
            vld.maxValueValidator(test, ageField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a number is equal to maxValue', function () {
            var test = new TestModel();
            test.age = 30;
            vld.maxValueValidator(test, ageField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a string is less than maxValue', function () {
            var test = new TestModel();
            test.name = 'b';
            vld.maxValueValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a string is equal to maxValue', function () {
            var test = new TestModel();
            test.name = 'jjj';
            vld.maxValueValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true (validation bypassed) when a value is not defined', function () {
            var test = new TestModel();
            vld.maxValueValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true (validation bypassed) when a value is null', function () {
            var test = new TestModel();
            test.name = null;
            vld.maxValueValidator(test, nameField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false when number is greater than maxValue', function () {
            var test = new TestModel();
            test.age = 45;
            vld.maxValueValidator(test, ageField, meta, op, vResult, opts);
            expectFailure('max_value', ageField.name, validationmsg_1.VALIDATION_MESSAGES.max_value(ageField.label, ageField.options.maxValue), vResult);
        });
        it('returns valid = false when string is greater than maxValue', function () {
            var test = new TestModel();
            test.name = 'zzz';
            vld.maxValueValidator(test, nameField, meta, op, vResult, opts);
            expectFailure('max_value', nameField.name, validationmsg_1.VALIDATION_MESSAGES.max_value(nameField.label, nameField.options.maxValue), vResult);
        });
    });
    describe('singleSelectionValidator()', function () {
        it('returns valid = true when a value is not defined', function () {
            var test = new TestModel();
            vld.singleSelectionValidator(test, genderField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a value is null', function () {
            var test = new TestModel();
            test.gender = null;
            vld.singleSelectionValidator(test, genderField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when the value is in the selection', function () {
            var test = new TestModel();
            test.gender = 'female';
            vld.singleSelectionValidator(test, genderField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false when the value is not in the selection', function () {
            var test = new TestModel();
            test.gender = 'hamster';
            vld.singleSelectionValidator(test, genderField, meta, op, vResult, opts);
            expectFailure('no_selection_match', genderField.name, validationmsg_1.VALIDATION_MESSAGES.no_selection_match(genderField.label), vResult);
        });
        it('returns valid = false when the value is a number that is not in the selection', function () {
            var test = new TestModel();
            test.gender = 222;
            vld.singleSelectionValidator(test, genderField, meta, op, vResult, opts);
            expectFailure('no_selection_match', genderField.name, validationmsg_1.VALIDATION_MESSAGES.no_selection_match(genderField.label), vResult);
        });
        it('returns valid = false when value is an empty string', function () {
            var test = new TestModel();
            test.gender = '';
            vld.singleSelectionValidator(test, genderField, meta, op, vResult, opts);
            expectFailure('no_selection_match', genderField.name, validationmsg_1.VALIDATION_MESSAGES.no_selection_match(genderField.label), vResult);
        });
    });
    describe('listEmptyValidator()', function () {
        it('returns valid = true when value is not defined', function () {
            var test = new TestModel();
            vld.listEmptyValidator(test, hobbiesField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when value is null', function () {
            var test = new TestModel();
            test.hobbies = null;
            vld.listEmptyValidator(test, hobbiesField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a list has multiple entries', function () {
            var test = new TestModel();
            test.hobbies = ['flibble', 'jibble'];
            vld.listEmptyValidator(test, hobbiesField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a list has one entry', function () {
            var test = new TestModel();
            test.hobbies = ['flibble'];
            vld.listEmptyValidator(test, hobbiesField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false when a list has no entries', function () {
            var test = new TestModel();
            test.hobbies = [];
            vld.listEmptyValidator(test, hobbiesField, meta, op, vResult, opts);
            expectFailure('list_empty', hobbiesField.name, validationmsg_1.VALIDATION_MESSAGES.list_empty(hobbiesField.label), vResult);
        });
    });
    describe('multipleSelectionValidator()', function () {
        it('returns valid = true when a value is not defined', function () {
            var test = new TestModel();
            vld.multipleSelectionValidator(test, hobbiesField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a value is null', function () {
            var test = new TestModel();
            test.hobbies = null;
            vld.multipleSelectionValidator(test, hobbiesField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when one value is in the selection', function () {
            var test = new TestModel();
            test.hobbies = ['ironing'];
            vld.multipleSelectionValidator(test, hobbiesField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when more than one value is in the selection', function () {
            var test = new TestModel();
            test.hobbies = ['ironing', 'extreme_ironing'];
            vld.multipleSelectionValidator(test, hobbiesField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false when value is just a string', function () {
            var test = new TestModel();
            test.hobbies = 'ironing';
            vld.multipleSelectionValidator(test, hobbiesField, meta, op, vResult, opts);
            expectFailure('selection_not_an_array', hobbiesField.name, validationmsg_1.VALIDATION_MESSAGES.selection_not_an_array(hobbiesField.label), vResult);
        });
        it('returns valid = false when value is just a number', function () {
            var test = new TestModel();
            test.hobbies = 222;
            vld.multipleSelectionValidator(test, hobbiesField, meta, op, vResult, opts);
            expectFailure('selection_not_an_array', hobbiesField.name, validationmsg_1.VALIDATION_MESSAGES.selection_not_an_array(hobbiesField.label), vResult);
        });
        it('returns valid = false when value is an object', function () {
            var test = new TestModel();
            test.hobbies = { flibble: true };
            vld.multipleSelectionValidator(test, hobbiesField, meta, op, vResult, opts);
            expectFailure('selection_not_an_array', hobbiesField.name, validationmsg_1.VALIDATION_MESSAGES.selection_not_an_array(hobbiesField.label), vResult);
        });
        it('returns valid = false when one value is not in the selection', function () {
            var test = new TestModel();
            test.hobbies = ['golf'];
            vld.multipleSelectionValidator(test, hobbiesField, meta, op, vResult, opts);
            expectFailure('no_selection_match', hobbiesField.name, validationmsg_1.VALIDATION_MESSAGES.no_selection_match(hobbiesField.label), vResult);
        });
        it('returns valid = false when one value is in the selection and one is not in the selection', function () {
            var test = new TestModel();
            test.hobbies = ['ironing', 'golf'];
            vld.multipleSelectionValidator(test, hobbiesField, meta, op, vResult, opts);
            expectFailure('no_selection_match', hobbiesField.name, validationmsg_1.VALIDATION_MESSAGES.no_selection_match(hobbiesField.label), vResult);
        });
        it('returns valid = false when one value is a number that is not in the selection', function () {
            var test = new TestModel();
            test.hobbies = [222];
            vld.multipleSelectionValidator(test, hobbiesField, meta, op, vResult, opts);
            expectFailure('no_selection_match', hobbiesField.name, validationmsg_1.VALIDATION_MESSAGES.no_selection_match(hobbiesField.label), vResult);
        });
        it('returns valid = false when value is an empty string', function () {
            var test = new TestModel();
            test.hobbies = [''];
            vld.multipleSelectionValidator(test, hobbiesField, meta, op, vResult, opts);
            expectFailure('no_selection_match', hobbiesField.name, validationmsg_1.VALIDATION_MESSAGES.no_selection_match(hobbiesField.label), vResult);
        });
    });
    describe('dateOnlyValidator()', function () {
        it('returns valid = true when a value is not defined', function () {
            var test = new TestModel();
            vld.dateOnlyValidator(test, dateField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a value is null', function () {
            var test = new TestModel();
            test.registered = null;
            vld.dateOnlyValidator(test, dateField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a date object is passed', function () {
            var test = new TestModel();
            test.registered = new Date('2016-12-01');
            vld.dateOnlyValidator(test, dateField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a date in the correct format is passed', function () {
            var test = new TestModel();
            test.registered = '2016-12-01';
            vld.dateOnlyValidator(test, dateField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false when a non-date object is set', function () {
            var test = new TestModel();
            test.registered = new TestModel();
            vld.dateOnlyValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_date', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_date(dateField.label), vResult);
        });
        it('returns valid = false when date string also contains a time', function () {
            var test = new TestModel();
            test.registered = '2016-12-01T12:00:00';
            vld.dateOnlyValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_date', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_date(dateField.label), vResult);
        });
        it('returns valid = false when date string is an invalid date', function () {
            var test = new TestModel();
            test.registered = '2016-00-12';
            vld.dateOnlyValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_date', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_date(dateField.label), vResult);
        });
        it('returns valid = false when string is not in the correct format', function () {
            var test = new TestModel();
            test.registered = '17 May 1985';
            vld.dateOnlyValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_date', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_date(dateField.label), vResult);
        });
        it('returns valid = false when string is empty', function () {
            var test = new TestModel();
            test.registered = '';
            vld.dateOnlyValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_date', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_date(dateField.label), vResult);
        });
    });
    describe('timeOnlyValidator()', function () {
        it('returns valid = true when a value is not defined', function () {
            var test = new TestModel();
            vld.timeOnlyValidator(test, dateField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a value is null', function () {
            var test = new TestModel();
            test.registered = null;
            vld.timeOnlyValidator(test, dateField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a date object is passed', function () {
            var test = new TestModel();
            test.registered = new Date('2016-12-01T12:11:01');
            vld.timeOnlyValidator(test, dateField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a time in the correct format is passed', function () {
            var test = new TestModel();
            test.registered = '15:11:01';
            vld.timeOnlyValidator(test, dateField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false when a non-date object is set', function () {
            var test = new TestModel();
            test.registered = new TestModel();
            vld.timeOnlyValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_time', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_time(dateField.label), vResult);
        });
        it('returns valid = false when time string also contains a date', function () {
            var test = new TestModel();
            test.registered = '2016-12-01T15:11:01';
            vld.timeOnlyValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_time', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_time(dateField.label), vResult);
        });
        it('returns valid = false when time string is an invalid time', function () {
            var test = new TestModel();
            test.registered = '56:21:32';
            vld.timeOnlyValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_time', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_time(dateField.label), vResult);
        });
        it('returns valid = false when string is not in the correct format', function () {
            var test = new TestModel();
            test.registered = '5:21 pm';
            vld.timeOnlyValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_time', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_time(dateField.label), vResult);
        });
        it('returns valid = false when string is empty', function () {
            var test = new TestModel();
            test.registered = '';
            vld.timeOnlyValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_time', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_time(dateField.label), vResult);
        });
    });
    describe('dateTimeValidator()', function () {
        it('returns valid = true when a value is not defined', function () {
            var test = new TestModel();
            vld.dateTimeValidator(test, dateField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a value is null', function () {
            var test = new TestModel();
            test.registered = null;
            vld.dateTimeValidator(test, dateField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a date object is passed', function () {
            var test = new TestModel();
            test.registered = new Date('2016-12-01T12:22:33');
            vld.dateTimeValidator(test, dateField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = true when a datetime in the correct format is passed', function () {
            var test = new TestModel();
            test.registered = '2016-12-01T12:22:33';
            vld.dateTimeValidator(test, dateField, meta, op, vResult, opts);
            chai_1.expect(vResult.valid).to.equal(true);
        });
        it('returns valid = false when a non-date object is set', function () {
            var test = new TestModel();
            test.registered = new TestModel();
            vld.dateTimeValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_datetime', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_datetime(dateField.label), vResult);
        });
        it('returns valid = false when datetime string does not contain a time', function () {
            var test = new TestModel();
            test.registered = '2016-12-01';
            vld.dateTimeValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_datetime', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_datetime(dateField.label), vResult);
        });
        it('returns valid = false when datetime string has an invalid date', function () {
            var test = new TestModel();
            test.registered = '2016-00-12T12:22:33';
            vld.dateTimeValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_datetime', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_datetime(dateField.label), vResult);
        });
        it('returns valid = false when datetime string has an invalid time', function () {
            var test = new TestModel();
            test.registered = '2016-01-12T25:22:33';
            vld.dateTimeValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_datetime', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_datetime(dateField.label), vResult);
        });
        it('returns valid = false when datetime string contains milliseconds and TZ', function () {
            var test = new TestModel();
            test.registered = '2016-01-12T11:22:33.000Z';
            vld.dateTimeValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_datetime', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_datetime(dateField.label), vResult);
        });
        it('returns valid = false when string is not in the correct format', function () {
            var test = new TestModel();
            test.registered = '17 May 1985 11:22:33';
            vld.dateTimeValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_datetime', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_datetime(dateField.label), vResult);
        });
        it('returns valid = false when string is empty', function () {
            var test = new TestModel();
            test.registered = '';
            vld.dateTimeValidator(test, dateField, meta, op, vResult, opts);
            expectFailure('not_a_datetime', dateField.name, validationmsg_1.VALIDATION_MESSAGES.not_a_datetime(dateField.label), vResult);
        });
    });
});
