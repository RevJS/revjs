
import { expect } from 'chai';
import rewire = require('rewire');

import * as d from '../../decorators';
import * as update from '../update';
import { MockBackend } from './mock-backend';
import { ModelValidationResult } from '../../validation/validationresult';
import { ModelManager } from '../../models/manager';
import { IUpdateOptions } from '../../models/types';

let GENDERS = [
    ['male', 'Male'],
    ['female', 'Female']
];

class TestModel {
    @d.TextField({ primaryKey: true })
        name: string;
    @d.SelectField({ selection: GENDERS })
        gender: string;
    @d.IntegerField({ required: false, minValue: 10 })
        age: number;
    @d.EmailField()
        email: string;
}

class TestModel2 {
    @d.TextField({ primaryKey: true, required: false })
        name: string;
}

class UnregisteredModel {}

class ModelWithNoPK {
    @d.TextField()
        name: string;
    @d.IntegerField()
        age: number;
}

let rewired = rewire('../update');
let rwUpdate: typeof update & typeof rewired = rewired as any;
let mockBackend: MockBackend;
let manager: ModelManager;

describe('rev.operations.update()', () => {

    beforeEach(() => {
        mockBackend = new MockBackend();
        manager = new ModelManager();
        manager.registerBackend('default', mockBackend);
        manager.register(TestModel);
        manager.register(ModelWithNoPK);
    });

    it('calls backend.update() and returns successful result if model is valid', () => {
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        model.age = 23;
        model.email = 'bob@test.com';
        return rwUpdate.update(manager, model)
            .then((res) => {
                expect(mockBackend.updateStub.callCount).to.equal(1);
                let updateCall = mockBackend.updateStub.getCall(0);
                expect(updateCall.args[1]).to.equal(model);
                expect(res.success).to.be.true;
                expect(res.validation).to.be.instanceOf(ModelValidationResult);
                expect(res.validation.valid).to.be.true;
            })
            .catch((e) => {
                console.log(e.result.validation);
                throw e;
            });
    });

    it('calls backend.update() with default "fields" and "where", if no options are set', () => {
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        let expectedOpts = Object.assign({}, update.DEFAULT_UPDATE_OPTIONS, {
            fields: ['name', 'gender'],
            where: { name: 'Bob' }
        });
        return rwUpdate.update(manager, model)
            .then((res) => {
                expect(mockBackend.updateStub.callCount).to.equal(1);
                let updateCall = mockBackend.updateStub.getCall(0);
                expect(updateCall.args[1]).to.equal(model);
                expect(updateCall.args[2]).to.deep.equal(expectedOpts);
            })
            .catch((e) => {
                console.log(e.result);
                throw e;
            });
    });

    it('"fields" option is based on model fields that are not undefined', () => {
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        model.age = 24;
        model.email = undefined;
        let expectedOpts = Object.assign({}, update.DEFAULT_UPDATE_OPTIONS, {
            fields: ['name', 'gender', 'age'],
            where: { name: 'Bob' }
        });
        return rwUpdate.update(manager, model)
            .then((res) => {
                expect(mockBackend.updateStub.callCount).to.equal(1);
                let updateCall = mockBackend.updateStub.getCall(0);
                expect(updateCall.args[1]).to.equal(model);
                expect(updateCall.args[2]).to.deep.equal(expectedOpts);
            })
            .catch((e) => {
                console.log(e.result);
                throw e;
            });
    });

    it('calls backend.update() with overridden options if they are set', () => {
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        const options: IUpdateOptions = {
            where: { name: 'Joanne' },
            fields: ['gender'],
        };
        return rwUpdate.update(manager, model, options)
            .then((res) => {
                expect(mockBackend.updateStub.callCount).to.equal(1);
                let updateCall = mockBackend.updateStub.getCall(0);
                expect(updateCall.args[1]).to.equal(model);
                expect(updateCall.args[2].where).to.deep.equal({ name: 'Joanne' });
                expect(updateCall.args[2].fields).to.deep.equal(['gender']);
            });
    });

    it('calls backend.update() with primary key where clause when opts.where is not set', () => {
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        return rwUpdate.update(manager, model)
            .then((res) => {
                expect(mockBackend.updateStub.callCount).to.equal(1);
                let updateCall = mockBackend.updateStub.getCall(0);
                expect(updateCall.args[1]).to.equal(model);
                expect(updateCall.args[2]).to.deep.include({
                    where: {
                        name: 'Bob'
                    }
                });
            });
    });

    it('rejects when model is not an object', () => {
        return rwUpdate.update(manager, 'test' as any)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('Specified model is not a Model instance');
            });
    });

    it('rejects if model is not registered', () => {
        let model = new UnregisteredModel();
        return rwUpdate.update(manager, model)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('is not registered');
            });
    });

    it('rejects if model meta.stored is false', () => {
        manager.register(TestModel2, { stored: false });
        let model = new TestModel2();
        return rwUpdate.update(manager, model)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('Cannot call update() on models with stored: false');
            });
    });

    it('rejects when where clause is not specified and model has no primary key', () => {
        let model = new ModelWithNoPK();
        return rwUpdate.update(manager, model)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('update() must be called with a where clause for models with no primaryKey');
            });
    });

    it('rejects when where clause is not specified and model primaryKey is undefined', () => {
        let model = new TestModel();
        return rwUpdate.update(manager, model)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('primary key field \'name\' is undefined');
            });
    });

    it('rejects when options.fields set to something other than an array', () => {
        let model = new TestModel();
        Object.assign(model, { name: 'bob', gender: 'male' });
        const options = {
            fields: 'name, gender' as any
        };
        return rwUpdate.update(manager, model, options)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('"fields" must be an array of field names');
            });
    });

    it('rejects when options.fields contains an invalid field name', () => {
        let model = new TestModel();
        Object.assign(model, { name: 'bob', gender: 'male' });
        const options = {
            fields: ['cc_number']
        };
        return rwUpdate.update(manager, model, options)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain(`Field 'cc_number' does not exist in model TestModel`);
            });
    });

    it('rejects with unsuccessful result when model fields do not pass validation', () => {
        let model = new TestModel();
        model.name = 'Bill';
        model.gender = 'fish';
        model.age = 9;
        model.email = 'www.google.com';
        return rwUpdate.update(manager, model)
            .then((res) => { throw new Error('expected reject'); })
            .catch((res) => {
                expect(res).to.be.instanceof(Error);
                expect(res.message).to.equal('ValidationError');
                expect(res.result).to.exist;
                expect(res.result.success).to.be.false;
                expect(res.result.validation).to.be.instanceOf(ModelValidationResult);
                expect(res.result.validation.valid).to.be.false;
            });
    });

    it('rejects with any operation errors added by the backend', () => {
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        mockBackend.errorsToAdd = ['some_backend_error'];
        return rwUpdate.update(manager, model)
            .then((res) => { throw new Error('expected reject'); })
            .catch((res) => {
                expect(res).to.be.instanceof(Error);
                expect(res.result).to.exist;
                expect(res.result.success).to.be.false;
                expect(res.result.errors.length).to.equal(1);
                expect(res.result.errors[0].message).to.equal('some_backend_error');
            });
    });

    it('rejects with any operation errors added by the backend', () => {
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        mockBackend.errorsToAdd = ['some_backend_error'];
        return rwUpdate.update(manager, model)
            .then((res) => { throw new Error('expected reject'); })
            .catch((res) => {
                expect(res).to.be.instanceof(Error);
                expect(res.result).to.exist;
                expect(res.result.success).to.be.false;
                expect(res.result.errors.length).to.equal(1);
                expect(res.result.errors[0].message).to.equal('some_backend_error');
            });
    });

    it('rejects with expected error when backend.update rejects', () => {
        let expectedError = new Error('epic fail!');
        let model = new TestModel();
        model.name = 'Bob';
        model.gender = 'male';
        mockBackend.errorToThrow = expectedError;
        return rwUpdate.update(manager, model)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err).to.equal(expectedError);
            });
    });

});
