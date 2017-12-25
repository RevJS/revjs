
import { expect } from 'chai';
import * as d from '../../../decorators';
import * as vld from '../record';
import { VALIDATION_MESSAGES as msg } from '../../validationmsg';

import { ModelValidationResult } from '../../validationresult';
import { IModelOperation } from '../../../operations/operation';
import { IValidationOptions } from '../../../operations/validate';
import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../../../backends/inmemory/backend';
import { expectValidationFailure } from './utils';

class TestModel {
    @d.IntegerField()
        id: any;
    @d.TextField()
        name: any;
    @d.RecordField({ model: 'TestRelatedModel' })
        record: any;
    @d.RecordField({ model: 'TestRelatedModelMultiKey' })
        recordMultiKey: any;
    @d.RecordListField({ model: 'TestRelatedModel' })
        recordList: any;
}

class TestRelatedModel {
    @d.IntegerField({ primaryKey: true})
        id: number;
    @d.TextField()
        name: string;
}
class TestRelatedModelMultiKey {
    @d.IntegerField({ primaryKey: true})
        id: number;
    @d.IntegerField({ primaryKey: true})
        id2: number;
    @d.TextField()
        name: string;
}
class TestUnrelatedModel {}

const manager = new ModelManager();
manager.registerBackend('default', new InMemoryBackend());
manager.register(TestModel);
manager.register(TestRelatedModel);
manager.register(TestRelatedModelMultiKey);

const meta = manager.getModelMeta(TestModel);
const recordField = meta.fieldsByName['record'];
const recordMultiKeyField = meta.fieldsByName['recordMultiKey'];
const recordListField = meta.fieldsByName['recordList'];

const op: IModelOperation = {
    operation: 'create'
};
const opts: IValidationOptions = {
    timeout: 200
};

describe('rev.fields.validators.record', () => {
    let vResult: ModelValidationResult;

    beforeEach(() => {
        vResult = new ModelValidationResult();
    });

    describe('recordClassValidator()', () => {

        it('returns valid = true when record is not defined', () => {
            let test = new TestModel();
            vld.recordClassValidator(manager, test, recordField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when record is null', () => {
            let test = new TestModel();
            test.record = null;
            vld.recordClassValidator(manager, test, recordField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when the value is an instance of the correct class', () => {
            let test = new TestModel();
            test.record = new TestRelatedModel();
            vld.recordClassValidator(manager, test, recordField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when the value is not an instance of the correct class', () => {
            let test = new TestModel();
            test.record = new TestUnrelatedModel();
            vld.recordClassValidator(manager, test, recordField, op, vResult, opts);
            expectValidationFailure('invalid_record_class', recordField.name, msg.invalid_record_class(recordField.name), vResult);
        });

        it('returns valid = false when the value is not an object', () => {
            let test = new TestModel();
            test.record = 222;
            vld.recordClassValidator(manager, test, recordField, op, vResult, opts);
            expectValidationFailure('invalid_record_class', recordField.name, msg.invalid_record_class(recordField.name), vResult);
        });

    });

    describe('recordPrimaryKeyValidator()', () => {

        it('returns valid = true when record is not defined', () => {
            let test = new TestModel();
            vld.recordPrimaryKeyValidator(manager, test, recordField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when record is null', () => {
            let test = new TestModel();
            test.record = null;
            vld.recordPrimaryKeyValidator(manager, test, recordField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when record is missing primary key field', () => {
            let test = new TestModel();
            test.record = {};
            vld.recordPrimaryKeyValidator(manager, test, recordField, op, vResult, opts);
            expectValidationFailure('missing_record_primary_key', recordField.name, msg.missing_record_primary_key(recordField.name), vResult);
        });

        it('returns valid = false when linked record primary key field is null', () => {
            let test = new TestModel();
            let record = new TestRelatedModel();
            record.id = null;
            test.record = record;
            vld.recordPrimaryKeyValidator(manager, test, recordField, op, vResult, opts);
            expectValidationFailure('missing_record_primary_key', recordField.name, msg.missing_record_primary_key(recordField.name), vResult);
        });

        it('returns valid = true when record contains primary key field', () => {
            let test = new TestModel();
            let record = new TestRelatedModel();
            record.id = 7;
            test.record = record;
            vld.recordPrimaryKeyValidator(manager, test, recordField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when multi-key linked record has null primary key values', () => {
            let test = new TestModel();
            let record = new TestRelatedModelMultiKey();
            record.id = null;
            record.id2 = null;
            test.recordMultiKey = record;
            vld.recordPrimaryKeyValidator(manager, test, recordMultiKeyField, op, vResult, opts);
            expectValidationFailure('missing_record_primary_key', recordMultiKeyField.name, msg.missing_record_primary_key(recordMultiKeyField.name), vResult);
        });

        it('returns valid = true when multi-key linked record contains at least one primary key value', () => {
            let test = new TestModel();
            let record = new TestRelatedModelMultiKey();
            record.id2 = 7;
            test.recordMultiKey = record;
            vld.recordPrimaryKeyValidator(manager, test, recordMultiKeyField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when multi-key linked record contains all primary key values', () => {
            let test = new TestModel();
            let record = new TestRelatedModelMultiKey();
            record.id = 2;
            record.id2 = 7;
            test.recordMultiKey = record;
            vld.recordPrimaryKeyValidator(manager, test, recordMultiKeyField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

    });

    describe('recordListClassValidator()', () => {

        it('returns valid = true when record is not defined', () => {
            let test = new TestModel();
            vld.recordListClassValidator(manager, test, recordListField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when record is null', () => {
            let test = new TestModel();
            test.recordList = null;
            vld.recordListClassValidator(manager, test, recordListField, op, vResult, opts);
            expectValidationFailure('invalid_record_list_data', recordListField.name, msg.invalid_record_list_data(recordListField.name), vResult);
        });

        it('returns valid = true when the value is an empty array', () => {
            let test = new TestModel();
            test.recordList = [];
            vld.recordListClassValidator(manager, test, recordListField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when array has an instance of the correct class', () => {
            let test = new TestModel();
            test.recordList = [new TestRelatedModel()];
            vld.recordListClassValidator(manager, test, recordListField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when field is just an instance of the correct class', () => {
            let test = new TestModel();
            test.recordList = new TestRelatedModel();
            vld.recordListClassValidator(manager, test, recordListField, op, vResult, opts);
            expectValidationFailure('invalid_record_list_data', recordListField.name, msg.invalid_record_list_data(recordListField.name), vResult);
        });

        it('returns valid = false when array has an instance of the wrong class', () => {
            let test = new TestModel();
            test.recordList = [new TestUnrelatedModel()];
            vld.recordListClassValidator(manager, test, recordListField, op, vResult, opts);
            expectValidationFailure('invalid_record_list_class', recordListField.name, msg.invalid_record_list_class(recordListField.name), vResult);
        });

        it('returns valid = false when array has a correct class and an invalid class instance', () => {
            let test = new TestModel();
            test.recordList = [new TestRelatedModel(), new TestUnrelatedModel()];
            vld.recordListClassValidator(manager, test, recordListField, op, vResult, opts);
            expectValidationFailure('invalid_record_list_class', recordListField.name, msg.invalid_record_list_class(recordListField.name), vResult);
        });

        it('returns valid = false when the value is not an array', () => {
            let test = new TestModel();
            test.recordList = {};
            vld.recordListClassValidator(manager, test, recordListField, op, vResult, opts);
            expectValidationFailure('invalid_record_list_data', recordListField.name, msg.invalid_record_list_data(recordListField.name), vResult);
        });

        it('returns valid = false when the array contains a value that is not an object', () => {
            let test = new TestModel();
            test.recordList = [222];
            vld.recordListClassValidator(manager, test, recordListField, op, vResult, opts);
            expectValidationFailure('invalid_record_list_class', recordListField.name, msg.invalid_record_list_class(recordListField.name), vResult);
        });

    });

});
