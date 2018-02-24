import { RelatedModelField, RelatedModelListField, IRelatedModelFieldOptions, DEFAULT_MODELLIST_FIELD_OPTIONS, IRelatedModelListFieldOptions } from '../relatedfields';
import { ModelValidationResult } from '../../validation/validationresult';
import { Field, DEFAULT_FIELD_OPTIONS } from '../field';
import { requiredValidator, modelClassValidator, modelListClassValidator, modelPrimaryKeyValidator } from '../../validation/validators';
import { IModelOperation } from '../../operations/operation';

import { expect } from 'chai';
import { ModelManager } from '../../models/manager';
import { InMemoryBackend } from '../../backends/inmemory/backend';
import * as d from '../../decorators';

class TestModel {
    @d.RelatedModel({ model: 'TestRelatedModel' })
        value: any;
    @d.RelatedModel({ model: 'TestRelatedModelMultiKey' })
        valueMulti: any;
}

class TestRelatedModel {
    @d.TextField({ primaryKey: true })
        name: string;
}

class TestUnrelatedModel {}

let manager = new ModelManager();
manager.registerBackend('default', new InMemoryBackend());
manager.register(TestModel);
manager.register(TestRelatedModel);

describe('rev.fields.relatedmodelfields', () => {
    let testOp: IModelOperation = {
        operationName: 'create'
    };
    let testModel: TestModel;
    let result: ModelValidationResult;

    beforeEach(() => {
        testModel = new TestModel();
        testModel.value = null;
        result = new ModelValidationResult();
    });

    describe('RelatedModelField', () => {
        const testOpts: IRelatedModelFieldOptions = {
            model: 'TestRelatedModel'
        };

        it('creates a field with properties as expected', () => {
            let test = new RelatedModelField('value', testOpts);
            expect(test.name).to.equal('value');
            expect(test.options).to.deep.equal(
                Object.assign({}, DEFAULT_FIELD_OPTIONS, testOpts));
            expect(test).is.instanceof(Field);
        });

        it('throws if passed model is not a string', () => {
            expect(() => {
                new RelatedModelField('value', {
                    model: 22 as any
                });
            }).to.throw('options.model must be a non-empty string');
        });

        it('throws if passed model is an empty string', () => {
            expect(() => {
                new RelatedModelField('value', {
                    model: ''
                });
            }).to.throw('options.model must be a non-empty string');
        });

        it('adds the just the record validators if options.required is false', () => {
            let test = new RelatedModelField('value', {model: 'TestRelatedModel', required: false });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(modelClassValidator);
            expect(test.validators[1]).to.equal(modelPrimaryKeyValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new RelatedModelField('value', {model: 'TestRelatedModel', required: true });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(modelClassValidator);
            expect(test.validators[2]).to.equal(modelPrimaryKeyValidator);
        });

        it('successfully validates a record', () => {
            let test = new RelatedModelField('value', {model: 'TestRelatedModel'});
            let model = new TestRelatedModel();
            model.name = 'fred';
            testModel.value = model;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates a null value if field not required', () => {
            let test = new RelatedModelField('value', {model: 'TestRelatedModel', required: false });
            testModel.value = null;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('does not validate on null value if field is required', () => {
            let test = new RelatedModelField('value', {model: 'TestRelatedModel', required: true });
            testModel.value = null;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate a record of the wrong class', () => {
            let test = new RelatedModelField('value', {model: 'TestRelatedModel'});
            testModel.value = new TestUnrelatedModel();
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate an array of models', () => {
            let test = new RelatedModelField('value', {model: 'TestRelatedModel'});
            testModel.value = [new TestRelatedModel()];
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

    });

    describe('RecordField.toBackendValue()', () => {

        const field = new RelatedModelField('value', {model: 'TestRelatedModel'});

        it('returns null if model field is not set', () => {
            const record = new TestModel();
            expect(field.toBackendValue(manager, record[field.name])).to.be.null;
        });

        it('returns null if model primary key field is not set', () => {
            const record = new TestModel();
            const linkedModel = new TestRelatedModel();
            record.value = linkedModel;
            expect(field.toBackendValue(manager, record[field.name])).to.be.null;
        });

        it('returns primary key value if model primary key field is set', () => {
            const record = new TestModel();
            const linkedModel = new TestRelatedModel();
            linkedModel.name = 'key_value';
            record.value = linkedModel;
            expect(field.toBackendValue(manager, record[field.name])).to.equal('key_value');
        });

    });

    describe('RecordListField', () => {
        const testOpts: IRelatedModelListFieldOptions = {
            model: 'TestRelatedModel',
            field: 'someField'
        };

        it('creates a field with properties as expected', () => {
            let test = new RelatedModelListField('value', testOpts);
            let expectedOptions = Object.assign(
                {}, DEFAULT_FIELD_OPTIONS, DEFAULT_MODELLIST_FIELD_OPTIONS, testOpts);

            expect(test.name).to.equal('value');
            expect(test.options).to.deep.equal(expectedOptions);
            expect(test).is.instanceof(Field);
        });

        it('does not add the required validator by default', () => {
            let test = new RelatedModelListField('value', testOpts);
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(modelListClassValidator);
        });

        it('throws if passed model is not a string', () => {
            expect(() => {
                new RelatedModelListField('value', {
                    model: 22 as any,
                    field: 'field'
                });
            }).to.throw('options.model must be a non-empty string');
        });

        it('throws if passed model is an empty string', () => {
            expect(() => {
                new RelatedModelListField('value', {
                    model: '',
                    field: 'field'
                });
            }).to.throw('options.model must be a non-empty string');
        });

        it('throws if passed field is not a string', () => {
            expect(() => {
                new RelatedModelListField('value', {
                    model: 'model',
                    field: 22 as any
                });
            }).to.throw('options.field must be a non-empty string');
        });

        it('throws if passed field is an empty string', () => {
            expect(() => {
                new RelatedModelListField('value', {
                    model: 'model',
                    field: ''
                });
            }).to.throw('options.field must be a non-empty string');
        });

        it('adds the just the recordListClassValidator if options.required is false', () => {
            let test = new RelatedModelListField('value', {model: 'TestRelatedModel', field: 'field', required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(modelListClassValidator);
        });

        it('adds the required validator if options.required is true', () => {
            let test = new RelatedModelListField('value', {model: 'TestRelatedModel', field: 'field', required: true });
            expect(test.validators.length).to.equal(2);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(modelListClassValidator);
        });

        it('successfully validates a record', () => {
            let test = new RelatedModelListField('value', {model: 'TestRelatedModel', field: 'field'});
            let model1 = new TestRelatedModel();
            let model2 = new TestRelatedModel();
            model1.name = 'Fred';
            model2.name = 'Bob';
            testModel.value = [model1, model2];
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('successfully validates an undefined value if field not required', () => {
            let test = new RelatedModelListField('value', {model: 'TestRelatedModel', field: 'field', required: false });
            testModel.value = undefined;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.true; });
        });

        it('does not validate an undefined value if field is required', () => {
            let test = new RelatedModelListField('value', {model: 'TestRelatedModel', field: 'field', required: true });
            testModel.value = undefined;
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate a record of the wrong class', () => {
            let test = new RelatedModelListField('value', {model: 'TestRelatedModel', field: 'field'});
            testModel.value = [new TestUnrelatedModel()];
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

        it('does not validate a plain instance of a model', () => {
            let test = new RelatedModelListField('value', {model: 'TestRelatedModel', field: 'field'});
            testModel.value = new TestRelatedModel();
            return test.validate(manager, testModel, testOp, result)
                .then((res) => { expect(res.valid).to.be.false; });
        });

    });

});
