
import { expect } from 'chai';
import rewire = require('rewire');

import * as d from '../../decorators';
import * as create from '../create';
import { MockBackend } from './mock-backend';
import { ModelValidationResult } from '../../validation/validationresult';
import { ModelManager } from '../../models/manager';
import { ValidationError } from '../../validation/validationerror';

let GENDERS = [
    ['male', 'Male'],
    ['female', 'Female']
];

class TestModel {
    @d.TextField()
        name: string;
    @d.SelectField({ selection: GENDERS })
        gender: string;
    @d.IntegerField({ required: false, minValue: 10 })
        age: number;
    @d.EmailField({ required: false })
        email: string;
}

class TestModel2 {
    @d.TextField({ required: false })
        name: string;
}

let rewired = rewire('../create');
let rwCreate: typeof create & typeof rewired = rewired as any;
let manager: ModelManager;
let mockBackend: MockBackend;

describe('rev.operations.create()', () => {

    beforeEach(() => {
        manager = new ModelManager();
        mockBackend = new MockBackend();
        manager.registerBackend('default', mockBackend);
        manager.register(TestModel);
    });

    it('calls backend.create() and returns successful result if model is valid', () => {
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        return rwCreate.create(manager, model)
            .then((res) => {
                expect(mockBackend.createStub.callCount).to.equal(1);
                let createCall = mockBackend.createStub.getCall(0);
                expect(createCall.args[1]).to.equal(model);
                expect(res.success).to.be.true;
                expect(res.validation).to.be.instanceOf(ModelValidationResult);
                expect(res.validation!.valid).to.be.true;
            });
    });

    it('calls backend.create() with DEFAULT_CREATE_OPTIONS if no options are set', () => {
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        return rwCreate.create(manager, model, undefined)
            .then((res) => {
                expect(mockBackend.createStub.callCount).to.equal(1);
                let readCall = mockBackend.createStub.getCall(0);
                expect(readCall.args[1]).to.equal(model);
                expect(readCall.args[2]).to.deep.equal(create.DEFAULT_CREATE_OPTIONS);
            });
    });

    it('calls backend.create() with overridden options if they are set', () => {
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        return rwCreate.create(manager, model, { validation: {} })
            .then((res) => {
                expect(mockBackend.createStub.callCount).to.equal(1);
                let readCall = mockBackend.createStub.getCall(0);
                expect(readCall.args[1]).to.equal(model);
                expect(readCall.args[2].validation).to.deep.equal({});
            });
    });

    it('rejects when model is not an object', () => {
        return rwCreate.create(manager, 'test' as any)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('Specified model is not a Model instance');
            });
    });

    it('rejects if model is not registered', () => {
        let model = new TestModel2();
        return rwCreate.create(manager, model)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('is not registered');
            });
    });

    it('rejects if model meta.stored is false', () => {
        manager.register(TestModel2, { stored: false });
        let model = new TestModel2();
        return rwCreate.create(manager, model)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('Cannot call create() on models with stored: false');
            });
    });

    it('rejects with unsuccessful result when model required fields not set', () => {
        let model = new TestModel();
        return rwCreate.create(manager, model)
            .then((res) => { throw new Error('expected reject'); })
            .catch((err) => {
                expect(err).to.be.instanceof(ValidationError);
                expect(err.validation).to.be.instanceOf(ModelValidationResult);
                expect(err.validation.valid).to.be.false;
                expect(err.result).to.exist;
                expect(err.result.success).to.be.false;
                expect(err.result.validation).to.be.instanceOf(ModelValidationResult);
                expect(err.result.validation.valid).to.be.false;
            });
    });

    it('rejects with unsuccessful result when model fields do not pass validation', () => {
        let model = new TestModel();
        model.name = 'Bill';
        model.gender = 'fish';
        model.age = 9;
        model.email = 'www.google.com';
        return rwCreate.create(manager, model)
            .then((res) => { throw new Error('expected reject'); })
            .catch((err) => {
                expect(err).to.be.instanceof(ValidationError);
                expect(err.validation).to.be.instanceOf(ModelValidationResult);
                expect(err.validation.valid).to.be.false;
                expect(err.result).to.exist;
                expect(err.result.success).to.be.false;
                expect(err.result.validation).to.be.instanceOf(ModelValidationResult);
                expect(err.result.validation.valid).to.be.false;
            });
    });

    it('rejects with any operation errors added by the backend', () => {
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        mockBackend.errorsToAdd = ['some_backend_error'];
        return rwCreate.create(manager, model)
            .then((res) => { throw new Error('expected reject'); })
            .catch((res) => {
                expect(res).to.be.instanceof(Error);
                expect(res.result).to.exist;
                expect(res.result.success).to.be.false;
                expect(res.result.errors.length).to.equal(1);
                expect(res.result.errors[0].message).to.equal('some_backend_error');
            });
    });

    it('rejects with expected error when backend.create rejects', () => {
        let expectedError = new Error('epic fail!');
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        mockBackend.errorToThrow = expectedError;
        return rwCreate.create(manager, model)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err).to.equal(expectedError);
            });
    });

});
