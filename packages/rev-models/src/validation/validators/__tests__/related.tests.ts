
import { expect } from 'chai';
import * as d from '../../../decorators';
import * as vld from '../related';
import { VALIDATION_MESSAGES as msg } from '../../validationmsg';

import { ModelValidationResult } from '../../validationresult';
import { IModelOperation } from '../../../operations/operation';
import { IValidationOptions } from '../../../models/types';
import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../../../backends/inmemory/backend';
import { expectValidationFailure } from './utils';

class TestModel {
    @d.IntegerField()
        id: any;
    @d.TextField()
        name: any;
    @d.RelatedModel({ model: 'TestRelatedModel' })
        model: any;
    @d.RelatedModelList({ model: 'TestRelatedModel', field: 'field' })
        modelList: any;
}

class TestRelatedModel {
    @d.IntegerField({ primaryKey: true})
        id: number;
    @d.TextField()
        name: string;
}

class TestUnrelatedModel {}

const manager = new ModelManager();
manager.registerBackend('default', new InMemoryBackend());
manager.register(TestModel);
manager.register(TestRelatedModel);

const meta = manager.getModelMeta(TestModel);
const relatedModelField = meta.fieldsByName['model'];
const modelListField = meta.fieldsByName['modelList'];

const op: IModelOperation = {
    operation: 'create'
};
const opts: IValidationOptions = {
    timeout: 200
};

describe('rev.fields.validators.related', () => {
    let vResult: ModelValidationResult;

    beforeEach(() => {
        vResult = new ModelValidationResult();
    });

    describe('modelClassValidator()', () => {

        it('returns valid = true when record is not defined', () => {
            let test = new TestModel();
            vld.modelClassValidator(manager, test, relatedModelField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when record is null', () => {
            let test = new TestModel();
            test.model = null;
            vld.modelClassValidator(manager, test, relatedModelField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when the value is an instance of the correct class', () => {
            let test = new TestModel();
            test.model = new TestRelatedModel();
            vld.modelClassValidator(manager, test, relatedModelField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when the value is not an instance of the correct class', () => {
            let test = new TestModel();
            test.model = new TestUnrelatedModel();
            vld.modelClassValidator(manager, test, relatedModelField, op, vResult, opts);
            expectValidationFailure('invalid_model_class', relatedModelField.name, msg.invalid_model_class(relatedModelField.name), vResult);
        });

        it('returns valid = false when the value is not an object', () => {
            let test = new TestModel();
            test.model = 222;
            vld.modelClassValidator(manager, test, relatedModelField, op, vResult, opts);
            expectValidationFailure('invalid_model_class', relatedModelField.name, msg.invalid_model_class(relatedModelField.name), vResult);
        });

    });

    describe('modelPrimaryKeyValidator()', () => {

        it('returns valid = true when record is not defined', () => {
            let test = new TestModel();
            vld.modelPrimaryKeyValidator(manager, test, relatedModelField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when record is null', () => {
            let test = new TestModel();
            test.model = null;
            vld.modelPrimaryKeyValidator(manager, test, relatedModelField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when record is missing primary key field', () => {
            let test = new TestModel();
            test.model = {};
            vld.modelPrimaryKeyValidator(manager, test, relatedModelField, op, vResult, opts);
            expectValidationFailure('missing_model_primary_key', relatedModelField.name, msg.missing_model_primary_key(relatedModelField.name), vResult);
        });

        it('returns valid = false when linked model primary key field is null', () => {
            let test = new TestModel();
            let record = new TestRelatedModel();
            record.id = null;
            test.model = record;
            vld.modelPrimaryKeyValidator(manager, test, relatedModelField, op, vResult, opts);
            expectValidationFailure('missing_model_primary_key', relatedModelField.name, msg.missing_model_primary_key(relatedModelField.name), vResult);
        });

        it('returns valid = true when record contains primary key field', () => {
            let test = new TestModel();
            let record = new TestRelatedModel();
            record.id = 7;
            test.model = record;
            vld.modelPrimaryKeyValidator(manager, test, relatedModelField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

    });

    describe('modelListClassValidator()', () => {

        it('returns valid = true when record is not defined', () => {
            let test = new TestModel();
            vld.modelListClassValidator(manager, test, modelListField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when record is null', () => {
            let test = new TestModel();
            test.modelList = null;
            vld.modelListClassValidator(manager, test, modelListField, op, vResult, opts);
            expectValidationFailure('invalid_model_list_data', modelListField.name, msg.invalid_model_list_data(modelListField.name), vResult);
        });

        it('returns valid = true when the value is an empty array', () => {
            let test = new TestModel();
            test.modelList = [];
            vld.modelListClassValidator(manager, test, modelListField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = true when array has an instance of the correct class', () => {
            let test = new TestModel();
            test.modelList = [new TestRelatedModel()];
            vld.modelListClassValidator(manager, test, modelListField, op, vResult, opts);
            expect(vResult.valid).to.equal(true);
        });

        it('returns valid = false when field is just an instance of the correct class', () => {
            let test = new TestModel();
            test.modelList = new TestRelatedModel();
            vld.modelListClassValidator(manager, test, modelListField, op, vResult, opts);
            expectValidationFailure('invalid_model_list_data', modelListField.name, msg.invalid_model_list_data(modelListField.name), vResult);
        });

        it('returns valid = false when array has an instance of the wrong class', () => {
            let test = new TestModel();
            test.modelList = [new TestUnrelatedModel()];
            vld.modelListClassValidator(manager, test, modelListField, op, vResult, opts);
            expectValidationFailure('invalid_model_list_class', modelListField.name, msg.invalid_model_list_class(modelListField.name), vResult);
        });

        it('returns valid = false when array has a correct class and an invalid class instance', () => {
            let test = new TestModel();
            test.modelList = [new TestRelatedModel(), new TestUnrelatedModel()];
            vld.modelListClassValidator(manager, test, modelListField, op, vResult, opts);
            expectValidationFailure('invalid_model_list_class', modelListField.name, msg.invalid_model_list_class(modelListField.name), vResult);
        });

        it('returns valid = false when the value is not an array', () => {
            let test = new TestModel();
            test.modelList = {};
            vld.modelListClassValidator(manager, test, modelListField, op, vResult, opts);
            expectValidationFailure('invalid_model_list_data', modelListField.name, msg.invalid_model_list_data(modelListField.name), vResult);
        });

        it('returns valid = false when the array contains a value that is not an object', () => {
            let test = new TestModel();
            test.modelList = [222];
            vld.modelListClassValidator(manager, test, modelListField, op, vResult, opts);
            expectValidationFailure('invalid_model_list_class', modelListField.name, msg.invalid_model_list_class(modelListField.name), vResult);
        });

    });

});
