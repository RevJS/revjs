
import { expect } from 'chai';
import * as rewire from 'rewire';

import { Model } from '../../models/model';
import * as d from '../../decorators';
import * as create from '../create';
import { MockBackend } from './mock-backend';
import { ModelValidationResult } from '../../validation/validationresult';
import { initialiseMeta } from '../../models/meta';

let GENDERS = [
    ['male', 'Male'],
    ['female', 'Female']
];

class TestModel extends Model {
    @d.TextField()
        name: string;
    @d.SelectionField({ selection: GENDERS })
        gender: string;
    @d.IntegerField({ required: false, minValue: 10 })
        age: number;
    @d.EmailField({ required: false })
        email: string;
}

initialiseMeta(TestModel);

let rewired = rewire('../create');
let rwCreate: typeof create & typeof rewired = rewired as any;
let mockBackend: MockBackend;

describe('rev.operations.create()', () => {

    beforeEach(() => {
        mockBackend = new MockBackend();
        rwCreate.__set__('backends', {
            get: () => mockBackend
        });
    });

    it('calls backend.create() and returns successful result if model is valid', () => {
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        return rwCreate.create(model)
            .then((res) => {
                expect(mockBackend.createStub.callCount).to.equal(1);
                let createCall = mockBackend.createStub.getCall(0);
                expect(createCall.args[0]).to.equal(model);
                expect(res.success).to.be.true;
                expect(res.validation).to.be.instanceOf(ModelValidationResult);
                expect(res.validation.valid).to.be.true;
            });
    });

    it('rejects if model metadata is not initialised', () => {
        class UnregisteredModel extends Model {}
        let model = new UnregisteredModel();
        return expect(rwCreate.create(model))
            .to.be.rejectedWith('MetadataError');
    });

    it('rejects if backends.get fails (e.g. invalid backend specified)', () => {
        let model = new TestModel();
        let expectedError = new Error('epic fail!');
        rwCreate.__set__('backends', {
            get: () => { throw expectedError; }
        });
        return expect(rwCreate.create(model))
            .to.be.rejectedWith(expectedError);
    });

    it('rejects for singleton models', () => {
        class SingletonModel extends Model {
            @d.TextField() name: string;
        }
        SingletonModel.meta = {
            singleton: true
        };
        let model = new SingletonModel();
        initialiseMeta(SingletonModel);
        return expect(rwCreate.create(model))
            .to.be.rejectedWith('create() cannot be called on singleton models');
    });

/*

    it('completes with unsuccessful result when model required fields not set', () => {
        let model = new TestModel();
        return ops.create(model)
            .then((res) => {
                expect(res.success).to.be.false;
                expect(res.errors.length).to.equal(1);
                expect(res.errors[0].message).to.equal(msg.failed_validation('TestModel'));
                expect(res.errors[0]['code']).to.equal('failed_validation');
                expect(res.validation).to.be.instanceOf(ModelValidationResult);
                expect(res.validation.valid).to.be.false;
            });
    });

    it('completes with unsuccessful result when model fields do not pass validation', () => {
        let model = new TestModel();
        model.name = 'Bill';
        model.gender = 'fish';
        model.age = 9;
        model.email = 'www.google.com';
        return ops.create(model)
            .then((res) => {
                expect(res.success).to.be.false;
                expect(res.errors.length).to.equal(1);
                expect(res.errors[0].message).to.equal(msg.failed_validation('TestModel'));
                expect(res.errors[0]['code']).to.equal('failed_validation');
                expect(res.validation).to.be.instanceOf(ModelValidationResult);
                expect(res.validation.valid).to.be.false;
            });
    });

    it('returns any operation errors added by the backend', () => {
        backendSpy = {
            create: sinon.spy((model: any, meta: any, result: any) => {
                result.addError('error_from_backend');
                return Promise.resolve(result);
            })
        };
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        return ops.create(model)
            .then((res) => {
                expect(res.success).to.be.false;
                expect(res.errors.length).to.equal(1);
                expect(res.errors[0].message).to.equal('error_from_backend');
            });
    });

    it('rejects when backend.create rejects', () => {
        backendSpy = {
            create: sinon.spy((model: any, meta: any, result: any) => {
                return Promise.reject(new Error('rejection_from_backend'));
            })
        };
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        return expect(ops.create(model))
            .to.be.rejectedWith('rejection_from_backend');
    });
*/
});