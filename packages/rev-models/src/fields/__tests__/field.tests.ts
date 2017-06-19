import { expect } from 'chai';
import { IFieldOptions, Field, DEFAULT_FIELD_OPTIONS } from '../field';
import { requiredValidator } from '../../validation/validators';
import { ModelValidationResult } from '../../validation/validationresult';
import { Model } from '../../models/model';
import { IModelOperation } from '../../operations/operation';
import { ModelRegistry } from '../../registry/registry';
import { IModelMeta } from '../../../lib/models/meta';

function quickValidAsyncValidator<T extends Model>(registry: ModelRegistry, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult) {
    return new Promise<void>((resolve, reject) => {
        resolve();
    });
}

function quickInvalidAsyncValidator<T extends Model>(registry: ModelRegistry, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult) {
    return new Promise<void>((resolve, reject) => {
        result.addFieldError('name', 'name field is invalid');
        resolve();
    });
}

function slowInvalidAsyncValidator<T extends Model>(registry: ModelRegistry, model: T, field: Field, operation: IModelOperation, result: ModelValidationResult) {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            result.addFieldError('name', 'name field is invalid');
            resolve();
        }, 8000);
    });
}

class TestModel extends Model {
    name: string;
}

let registry = new ModelRegistry();

describe('rev.fields.field', () => {
    let meta: IModelMeta<TestModel>;
    let testOp: IModelOperation = {
        operation: 'create'
    };

    beforeEach(() => {
        meta = {};
    });

    describe('Field - constructor()', () => {

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {
                required: true
            };
            let test = new Field('name', opts);
            expect(test.name).to.equal('name');
            expect(test.options).to.deep.equal(opts);
        });

        it('cannot be created without a name', () => {
            expect(() => {
                new Field(undefined, undefined);
            }).to.throw('new fields must have a name');
        });

        it('sets default field options if they are not specified', () => {
            let test = new Field('name');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
        });

        it('throws an error if options is not an object', () => {
            expect(() => {
                new Field('name', () => '33');
            }).to.throw('the options parameter must be an object');
        });

        it('adds the "required" validator if options.required is true', () => {
            let test = new Field('name', { required: true });
            expect(test.validators[0]).to.equal(requiredValidator);
        });

        it('adds the "required" validator if options.required is not specified', () => {
            let test = new Field('name', { });
            expect(test.validators[0]).to.equal(requiredValidator);
        });

        it('does not add any validators if options.required is false', () => {
            let test = new Field('name', { required: false });
            expect(test.validators.length).to.equal(0);
        });

    });

    describe('Field - validate()', () => {
        let testModel: TestModel;
        let result: ModelValidationResult;

        beforeEach(() => {
            testModel = new TestModel({ name: null });
            result = new ModelValidationResult();
        });

        it('returns a resolved promise when validation completes - no validators', () => {
            let test = new Field('name', { required: false });
            return test.validate(registry, testModel, testOp, result)
            .then((res) => { expect(res.valid).to.be.true; });
        });

        it('returns a resolved promise when validation completes - required validator', () => {
            let test = new Field('name', { required: true });
            testModel.name = 'Frank';
            return test.validate(registry, testModel, testOp, result)
            .then((res) => { expect(res.valid).to.be.true; });
        });

        it('validation fails as expected when required field not set', () => {
            let test = new Field('name', { required: true });
            return test.validate(registry, testModel, testOp, result)
            .then((res) => { expect(res.valid).to.be.false; });
        });

        it('returns valid = true when validation completes with a valid async validator', () => {
            let test = new Field('name', { required: false });
            test.asyncValidators.push(quickValidAsyncValidator);
            return test.validate(registry, testModel, testOp, result)
            .then((res) => { expect(res.valid).to.be.true; });
        });

        it('returns valid = false when validation completes with an invalid async validator', () => {
            let test = new Field('name', { required: false });
            test.asyncValidators.push(quickInvalidAsyncValidator);
            return test.validate(registry, testModel, testOp, result)
            .then((res) => { expect(res.valid).to.be.false; });
        });

        it('returns valid = false when validation completes with a valid and an invalid async validator', () => {
            let test = new Field('name', { required: false });
            test.asyncValidators.push(quickValidAsyncValidator);
            test.asyncValidators.push(quickInvalidAsyncValidator);
            return test.validate(registry, testModel, testOp, result)
            .then((res) => { expect(res.valid).to.be.false; });
        });

        it('returns a rejected promise when async validation times out', () => {
            let test = new Field('name', { required: false });
            test.asyncValidators.push(slowInvalidAsyncValidator);
            return test.validate(registry, testModel, testOp, result, {
                    timeout: 100
                })
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('timed out');
                });
        });

    });

});
