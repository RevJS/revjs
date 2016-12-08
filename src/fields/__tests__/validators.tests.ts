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
let nameField = new fld.TextField('name', 'Name');
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

        it('returns valid = false for a string of spaces', () => {
            let test = new TestModel();
            test.name = '    ';
            vld.stringEmptyValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('string_empty', nameField.name, msg.string_empty(nameField.label), vResult);
        });

        it('returns valid = false for a string with other whitespace characters', () => {
            let test = new TestModel();
            test.name = '  \r\n \n  \t  ';
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
});
