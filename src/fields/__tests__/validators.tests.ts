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

    describe('requiredValidator()', () => {

        it('returns valid = true when a string is specified', () => {
            let test = new TestModel();
            test.name = 'flibble';
            vld.stringValidator(test, nameField, meta, 'create', vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a value is not defined', () => {
            let test = new TestModel();
            vld.stringValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('string', nameField.name, msg.is_string(nameField.label), vResult);
        });

        it('returns valid = false when a value is not a string', () => {
            let test = new TestModel();
            test.name = 22;
            vld.stringValidator(test, nameField, meta, 'create', vResult, opts);
            expectFailure('string', nameField.name, msg.is_string(nameField.label), vResult);
        });

    });
});
