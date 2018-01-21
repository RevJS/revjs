
import { expect } from 'chai';
import * as fld from '../../../fields';
import * as vld from '../selection';
import { VALIDATION_MESSAGES as msg } from '../../validationmsg';

import { ModelValidationResult } from '../../validationresult';
import { IModelOperation } from '../../../operations/operation';
import { IValidationOptions } from '../../../operations/validate';
import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../../../backends/inmemory/backend';
import { expectValidationFailure } from './utils';

class TestModel {
    id: any;
    name: any;
    gender: any;
    hobbies: any;
}

let idField = new fld.IntegerField('id');
let nameField = new fld.TextField('name', {
    minLength: 5, maxLength: 10,
    minValue: 'ddd', maxValue: 'jjj',
    regEx: /^abc\d.$/  // abc[number][anything]
});
let genderField = new fld.SelectField('gender', {
        selection: [
            ['male', 'Male'],
            ['female', 'Female']
        ]
    });
let hobbiesField = new fld.SelectField('hobbies', {
        selection: [
            ['ironing', 'Ironing'],
            ['extreme_ironing', 'Extreme Ironing'],
            ['naked_ironing', 'Naked Ironing']
        ],
        multiple: true
    });

let manager = new ModelManager();
manager.registerBackend('default', new InMemoryBackend());
manager.register(TestModel, {
    fields: [
        idField, nameField, genderField
    ]
});

let op: IModelOperation = {
    operation: 'create'
};
let opts: IValidationOptions = {
    timeout: 200
};

describe('rev.fields.validators.selection', () => {
    let vResult: ModelValidationResult;

    beforeEach(() => {
        vResult = new ModelValidationResult();
    });

    describe('singleSelectionValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.singleSelectionValidator(manager, test, genderField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.gender = null;
            vld.singleSelectionValidator(manager, test, genderField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when the value is in the selection', () => {
            let test = new TestModel();
            test.gender = 'female';
            vld.singleSelectionValidator(manager, test, genderField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when the value is not in the selection', () => {
            let test = new TestModel();
            test.gender = 'hamster';
            vld.singleSelectionValidator(manager, test, genderField, op, vResult, opts);
            expectValidationFailure('no_selection_match', genderField.name, msg.no_selection_match(genderField.name), vResult);
        });

        it('returns valid = false when the value is a number that is not in the selection', () => {
            let test = new TestModel();
            test.gender = 222;
            vld.singleSelectionValidator(manager, test, genderField, op, vResult, opts);
            expectValidationFailure('no_selection_match', genderField.name, msg.no_selection_match(genderField.name), vResult);
        });

        it('returns valid = false when value is an empty string', () => {
            let test = new TestModel();
            test.gender = '';
            vld.singleSelectionValidator(manager, test, genderField, op, vResult, opts);
            expectValidationFailure('no_selection_match', genderField.name, msg.no_selection_match(genderField.name), vResult);
        });

    });

    describe('listEmptyValidator()', () => {

        it('returns valid = true when value is not defined', () => {
            let test = new TestModel();
            vld.listEmptyValidator(manager, test, hobbiesField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when value is null', () => {
            let test = new TestModel();
            test.hobbies = null;
            vld.listEmptyValidator(manager, test, hobbiesField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a list has multiple entries', () => {
            let test = new TestModel();
            test.hobbies = ['flibble', 'jibble'];
            vld.listEmptyValidator(manager, test, hobbiesField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a list has one entry', () => {
            let test = new TestModel();
            test.hobbies = ['flibble'];
            vld.listEmptyValidator(manager, test, hobbiesField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a list has no entries', () => {
            let test = new TestModel();
            test.hobbies = [];
            vld.listEmptyValidator(manager, test, hobbiesField, op, vResult, opts);
            expectValidationFailure('list_empty', hobbiesField.name, msg.list_empty(hobbiesField.name), vResult);
        });

    });

    describe('multipleSelectionValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.multipleSelectionValidator(manager, test, hobbiesField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.hobbies = null;
            vld.multipleSelectionValidator(manager, test, hobbiesField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when one value is in the selection', () => {
            let test = new TestModel();
            test.hobbies = ['ironing'];
            vld.multipleSelectionValidator(manager, test, hobbiesField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when more than one value is in the selection', () => {
            let test = new TestModel();
            test.hobbies = ['ironing', 'extreme_ironing'];
            vld.multipleSelectionValidator(manager, test, hobbiesField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when value is just a string', () => {
            let test = new TestModel();
            test.hobbies = 'ironing';
            vld.multipleSelectionValidator(manager, test, hobbiesField, op, vResult, opts);
            expectValidationFailure('selection_not_an_array', hobbiesField.name, msg.selection_not_an_array(hobbiesField.name), vResult);
        });

        it('returns valid = false when value is just a number', () => {
            let test = new TestModel();
            test.hobbies = 222;
            vld.multipleSelectionValidator(manager, test, hobbiesField, op, vResult, opts);
            expectValidationFailure('selection_not_an_array', hobbiesField.name, msg.selection_not_an_array(hobbiesField.name), vResult);
        });

        it('returns valid = false when value is an object', () => {
            let test = new TestModel();
            test.hobbies = { flibble: true };
            vld.multipleSelectionValidator(manager, test, hobbiesField, op, vResult, opts);
            expectValidationFailure('selection_not_an_array', hobbiesField.name, msg.selection_not_an_array(hobbiesField.name), vResult);
        });

        it('returns valid = false when one value is not in the selection', () => {
            let test = new TestModel();
            test.hobbies = ['golf'];
            vld.multipleSelectionValidator(manager, test, hobbiesField, op, vResult, opts);
            expectValidationFailure('no_selection_match', hobbiesField.name, msg.no_selection_match(hobbiesField.name), vResult);
        });

        it('returns valid = false when one value is in the selection and one is not in the selection', () => {
            let test = new TestModel();
            test.hobbies = ['ironing', 'golf'];
            vld.multipleSelectionValidator(manager, test, hobbiesField, op, vResult, opts);
            expectValidationFailure('no_selection_match', hobbiesField.name, msg.no_selection_match(hobbiesField.name), vResult);
        });

        it('returns valid = false when one value is a number that is not in the selection', () => {
            let test = new TestModel();
            test.hobbies = [222];
            vld.multipleSelectionValidator(manager, test, hobbiesField, op, vResult, opts);
            expectValidationFailure('no_selection_match', hobbiesField.name, msg.no_selection_match(hobbiesField.name), vResult);
        });

        it('returns valid = false when value is an empty string', () => {
            let test = new TestModel();
            test.hobbies = [''];
            vld.multipleSelectionValidator(manager, test, hobbiesField, op, vResult, opts);
            expectValidationFailure('no_selection_match', hobbiesField.name, msg.no_selection_match(hobbiesField.name), vResult);
        });

    });

});
