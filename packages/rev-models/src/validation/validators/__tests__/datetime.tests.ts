
import { expect } from 'chai';
import * as fld from '../../../fields';
import * as vld from '../datetime';
import { VALIDATION_MESSAGES as msg } from '../../validationmsg';

import { ModelValidationResult } from '../../validationresult';
import { IModelOperation } from '../../../operations/operation';
import { IValidationOptions } from '../../../models/types';
import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../../../backends/inmemory/backend';
import { expectValidationFailure } from './utils';

class TestModel {
    id: any;
    name: any;
    registered: any;
}

let idField = new fld.IntegerField('id');
let nameField = new fld.TextField('name', {
    minLength: 5, maxLength: 10,
    regEx: /^abc\d.$/  // abc[number][anything]
});
let dateField = new fld.DateTimeField('registered');

let manager = new ModelManager();
manager.registerBackend('default', new InMemoryBackend());
manager.register(TestModel, {
    fields: [
        idField, nameField, dateField
    ]
});

let op: IModelOperation = {
    operation: 'create'
};
let opts: IValidationOptions = {
    timeout: 200
};

describe('rev.fields.validators.datetime', () => {
    let vResult: ModelValidationResult;

    beforeEach(() => {
        vResult = new ModelValidationResult();
    });

    describe('dateOnlyValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.dateOnlyValidator(manager, test, dateField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.registered = null;
            vld.dateOnlyValidator(manager, test, dateField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a date object is passed', () => {
            let test = new TestModel();
            test.registered = new Date('2016-12-01');
            vld.dateOnlyValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_date', dateField.name, msg.not_a_date(dateField.name), vResult);
        });

        it('returns valid = true when a date in the correct format is passed', () => {
            let test = new TestModel();
            test.registered = '2016-12-01';
            vld.dateOnlyValidator(manager, test, dateField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a non-date object is set', () => {
            let test = new TestModel();
            test.registered = new TestModel();
            vld.dateOnlyValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_date', dateField.name, msg.not_a_date(dateField.name), vResult);
        });

        it('returns valid = false when date string also contains a time', () => {
            let test = new TestModel();
            test.registered = '2016-12-01T12:00:00';
            vld.dateOnlyValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_date', dateField.name, msg.not_a_date(dateField.name), vResult);
        });

        it('returns valid = false when date string is an invalid date', () => {
            let test = new TestModel();
            test.registered = '2016-00-12';
            vld.dateOnlyValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_date', dateField.name, msg.not_a_date(dateField.name), vResult);
        });

        it('returns valid = false when string is not in the correct format', () => {
            let test = new TestModel();
            test.registered = '17 May 1985';
            vld.dateOnlyValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_date', dateField.name, msg.not_a_date(dateField.name), vResult);
        });

        it('returns valid = false when string is empty', () => {
            let test = new TestModel();
            test.registered = '';
            vld.dateOnlyValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_date', dateField.name, msg.not_a_date(dateField.name), vResult);
        });

    });

    describe('timeOnlyValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.timeOnlyValidator(manager, test, dateField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.registered = null;
            vld.timeOnlyValidator(manager, test, dateField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a date object is passed', () => {
            let test = new TestModel();
            test.registered = new Date('2016-12-01');
            vld.timeOnlyValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_time', dateField.name, msg.not_a_time(dateField.name), vResult);
        });

        it('returns valid = true when a time in the correct format is passed', () => {
            let test = new TestModel();
            test.registered = '15:11:01';
            vld.timeOnlyValidator(manager, test, dateField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a non-date object is set', () => {
            let test = new TestModel();
            test.registered = new TestModel();
            vld.timeOnlyValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_time', dateField.name, msg.not_a_time(dateField.name), vResult);
        });

        it('returns valid = false when time string also contains a date', () => {
            let test = new TestModel();
            test.registered = '2016-12-01T15:11:01';
            vld.timeOnlyValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_time', dateField.name, msg.not_a_time(dateField.name), vResult);
        });

        it('returns valid = false when time string is an invalid time', () => {
            let test = new TestModel();
            test.registered = '56:21:32';
            vld.timeOnlyValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_time', dateField.name, msg.not_a_time(dateField.name), vResult);
        });

        it('returns valid = false when string is not in the correct format', () => {
            let test = new TestModel();
            test.registered = '5:21 pm';
            vld.timeOnlyValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_time', dateField.name, msg.not_a_time(dateField.name), vResult);
        });

        it('returns valid = false when string is empty', () => {
            let test = new TestModel();
            test.registered = '';
            vld.timeOnlyValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_time', dateField.name, msg.not_a_time(dateField.name), vResult);
        });

    });

    describe('dateTimeValidator()', () => {

        it('returns valid = true when a value is not defined', () => {
            let test = new TestModel();
            vld.dateTimeValidator(manager, test, dateField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when a value is null', () => {
            let test = new TestModel();
            test.registered = null;
            vld.dateTimeValidator(manager, test, dateField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a date object is passed', () => {
            let test = new TestModel();
            test.registered = new Date('2016-12-01');
            vld.dateTimeValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_datetime', dateField.name, msg.not_a_datetime(dateField.name), vResult);
        });

        it('returns valid = true when a datetime in the correct format is passed', () => {
            let test = new TestModel();
            test.registered = '2016-12-01T12:22:33';
            vld.dateTimeValidator(manager, test, dateField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when a non-date object is set', () => {
            let test = new TestModel();
            test.registered = new TestModel();
            vld.dateTimeValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_datetime', dateField.name, msg.not_a_datetime(dateField.name), vResult);
        });

        it('returns valid = false when datetime string does not contain a time', () => {
            let test = new TestModel();
            test.registered = '2016-12-01';
            vld.dateTimeValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_datetime', dateField.name, msg.not_a_datetime(dateField.name), vResult);
        });

        it('returns valid = false when datetime string has an invalid date', () => {
            let test = new TestModel();
            test.registered = '2016-00-12T12:22:33';
            vld.dateTimeValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_datetime', dateField.name, msg.not_a_datetime(dateField.name), vResult);
        });

        it('returns valid = false when datetime string has an invalid time', () => {
            let test = new TestModel();
            test.registered = '2016-01-12T25:22:33';
            vld.dateTimeValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_datetime', dateField.name, msg.not_a_datetime(dateField.name), vResult);
        });

        it('returns valid = false when datetime string contains milliseconds and TZ', () => {
            let test = new TestModel();
            test.registered = '2016-01-12T11:22:33.000Z';
            vld.dateTimeValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_datetime', dateField.name, msg.not_a_datetime(dateField.name), vResult);
        });

        it('returns valid = false when string is not in the correct format', () => {
            let test = new TestModel();
            test.registered = '17 May 1985 11:22:33';
            vld.dateTimeValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_datetime', dateField.name, msg.not_a_datetime(dateField.name), vResult);
        });

        it('returns valid = false when string is empty', () => {
            let test = new TestModel();
            test.registered = '';
            vld.dateTimeValidator(manager, test, dateField, op, vResult, opts);
            expectValidationFailure('not_a_datetime', dateField.name, msg.not_a_datetime(dateField.name), vResult);
        });

    });

});
