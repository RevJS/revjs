import { expect } from 'chai';
import * as sinon from 'sinon';
import * as d from '../../decorators';
import { IModelMeta } from '../../models/types';
import { TextField } from '../../fields/';
import { validate, IValidationContext } from '../validate';
import { VALIDATION_MESSAGES as msg } from '../../validation/validationmsg';
import { ModelManager } from '../../models/manager';
import { InMemoryBackend } from '../../backends/inmemory/backend';

describe('validate()', () => {
    let manager: ModelManager;

    class TestModel {
        @d.IntegerField({ minValue: 10 })
            id: number;
        @d.TextField()
            name: string;
        @d.DateField({ required: false })
            date: string;

        testMethod() {
            return true;
        }

        validate(vc: IValidationContext) {}
        validateAsync(vc: IValidationContext): any {}

        constructor(data: any) {
            Object.assign(this, data);
        }
    }

    let validModel = new TestModel({
        id: 11, name: 'Fred'
    });

    beforeEach(() => {
        manager = new ModelManager();
        manager.registerBackend('default', new InMemoryBackend());
        manager.register(TestModel);

        TestModel.prototype.validate = () => undefined;
        TestModel.prototype.validateAsync = () => Promise.resolve();
    });

    it('should return a valid result if valid object is passed', () => {

        let test = new TestModel({
            id: 11,
            name: 'Harry',
            date: '2018-01-02'
        });

        return validate(manager, test, {operation: 'create'})
            .then((res) => {
                expect(res.valid).to.equal(true);
            });
    });

    it('should reject if model not registered', () => {
        class UnregisteredModel {}
        let test = new UnregisteredModel();
        return validate(manager, test, {operation: 'create'})
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('is not registered');
            });
    });

    it('should return an invalid result if extra fields are present', () => {

        let test = new TestModel({
            id: 11,
            name: 'Harry',
            date: '2018-01-02',
            extra: 'stuff'
        });

        return validate(manager, test, {operation: 'create'})
            .then((res) => {
                expect(res.valid).to.equal(false);
                expect(res.modelErrors.length).to.equal(1);
                expect(res.modelErrors[0]['message']).to.equal(msg.extra_field('extra'));
                expect(res.modelErrors[0]['code']).to.equal('extra_field');
            });
    });

    it('should only validate specific fields if the fields option is set', () => {

        let test = new TestModel({
            id: 'not an id',
            name: 'Harry',
            date: 'not a date'
        });

        return validate(manager, test, {operation: 'create'}, {
            fields: ['name']
        })
            .then((res) => {
                expect(res.valid).to.equal(true);
            });
    });

    it('should return an invalid result if a field value is invalid', () => {

        let test = new TestModel({
            id: 2,
            name: 'Harry',
            date: '2018-01-02'
        });

        return validate(manager, test, {operation: 'create'})
            .then((res) => {
                expect(res.valid).to.equal(false);
                expect(res.fieldErrors['id'].length).to.equal(1);
                expect(res.fieldErrors['id'][0]['message']).to.equal(msg.min_value('id', 10));
                expect(res.fieldErrors['id'][0]['code']).to.equal('min_value');
            });
    });

    it('should return an invalid result if a required field is not set', () => {

        let test = new TestModel({
            id: 11
        });

        return validate(manager, test, {operation: 'create'})
            .then((res) => {
                expect(res.valid).to.equal(false);
                expect(res.fieldErrors['name'].length).to.equal(1);
                expect(res.fieldErrors['name'][0]['message']).to.equal(msg.required('name'));
                expect(res.fieldErrors['name'][0]['code']).to.equal('required');
            });
    });

    it('should reject if validation timeout expires', () => {
        let delayModelMeta: IModelMeta<any> = {
            fields: []
        };
        let delayField = new TextField('test');
        delayField.asyncValidators.push((...args: any[]) => {
            return new Promise<void>((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, 10000);
            });
        });
        delayModelMeta.fields.push(delayField);

        class DelayModel {}
        manager.register(DelayModel, delayModelMeta);
        let test = new DelayModel();

        return validate(manager, test, {operation: 'create'}, { timeout: 10})
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('timed out');
            });
    });

    describe('IModel.validate()', () => {

        it('IModel.validate() called with IValidationContext', () => {
            let validateSpy = sinon.spy();
            TestModel.prototype.validate = validateSpy;

            return validate(manager, validModel, {operation: 'create'})
                .then((res) => {
                    expect(validateSpy.callCount).to.equal(1);
                    expect(validateSpy.getCall(0).args.length).to.equal(1);
                    expect(validateSpy.getCall(0).args[0]).to.deep.equal({
                        manager: manager,
                        operation: { operation: 'create' },
                        options: undefined,
                        result: res
                    });
                });
        });

        it('should return a valid result if model has no validate method', () => {

            TestModel.prototype.validate = undefined;

            return validate(manager, validModel, {operation: 'create'})
                .then((res) => {
                    expect(res.valid).to.equal(true);
                    expect(res.fieldErrors).to.deep.equal({});
                });
        });

        it('should return a valid result if model.validate does not set an error', () => {

            TestModel.prototype.validate = () => undefined;

            return validate(manager, validModel, {operation: 'create'})
                .then((res) => {
                    expect(res.valid).to.equal(true);
                    expect(res.fieldErrors).to.deep.equal({});
                });
        });

        it('should return an invalid result if model.validate sets an error', () => {

            TestModel.prototype.validate = (vc: IValidationContext) => {
                vc.result.addFieldError('name', 'That name is too stupid!', 'daftness', { stupidityLevel: 10 });
            };

            return validate(manager, validModel, {operation: 'create'})
                .then((res) => {
                    expect(res.valid).to.equal(false);
                    expect(res.fieldErrors['name'].length).to.equal(1);
                    expect(res.fieldErrors['name'][0]).to.deep.equal({
                        message: 'That name is too stupid!',
                        code: 'daftness',
                        stupidityLevel: 10
                    });
                });
        });

        it('should reject if model validate() throws an error', () => {

            TestModel.prototype.validate = (vc: IValidationContext) => {
                throw new Error('Validator epic fail...');
            };

            return validate(manager, validModel, {operation: 'create'})
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('Validator epic fail...');
                });
        });

    });

    describe('IModel.validateAsync()', () => {

        it('IModel.validateAsync() called with IValidationContext', () => {
            let validateSpy = sinon.spy();
            TestModel.prototype.validateAsync = validateSpy;

            return validate(manager, validModel, {operation: 'create'})
                .then((res) => {
                    expect(validateSpy.callCount).to.equal(1);
                    expect(validateSpy.getCall(0).args.length).to.equal(1);
                    expect(validateSpy.getCall(0).args[0]).to.deep.equal({
                        manager: manager,
                        operation: { operation: 'create' },
                        options: undefined,
                        result: res
                    });
                });
        });

        it('should return a valid result if model has no validateAsync method', () => {

            TestModel.prototype.validateAsync = undefined;

            return validate(manager, validModel, {operation: 'create'})
                .then((res) => {
                    expect(res.valid).to.equal(true);
                    expect(res.fieldErrors).to.deep.equal({});
                });
        });

        it('should return an invalid result if model validateAsync() fails', () => {

            TestModel.prototype.validateAsync = (vc: IValidationContext) => {
                return new Promise<void>((resolve, reject) => {
                    vc.result.addFieldError('name', 'Google says that name is stupid', 'daftness', { stupidRank: 99 });
                    resolve();
                });
            };

            return validate(manager, validModel, {operation: 'create'})
                .then((res) => {
                    expect(res.valid).to.equal(false);
                    expect(res.fieldErrors['name'].length).to.equal(1);
                    expect(res.fieldErrors['name'][0]).to.deep.equal({
                        message: 'Google says that name is stupid',
                        code: 'daftness',
                        stupidRank: 99
                    });
                });
        });

        it('should reject if model validateAsync() throws an error', () => {

            TestModel.prototype.validateAsync = (vc: IValidationContext) => {
                throw new Error('Async Validator epic fail...');
            };

            return validate(manager, validModel, {operation: 'create'})
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('Async Validator epic fail...');
                });
        });

        it('should reject if model validateAsync() rejects', () => {

            TestModel.prototype.validateAsync = (vc: IValidationContext) => {
                return Promise.reject(new Error('Can handle rejection...'));
            };

            return validate(manager, validModel, {operation: 'create'})
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('Can handle rejection...');
                });
        });

        it('should reject if model validateAsync times out', () => {

            TestModel.prototype.validateAsync = (vc: IValidationContext) => {
                return new Promise<void>((resolve, reject) => {
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                });
            };

            return validate(manager, validModel, {operation: 'create'}, { timeout: 10 })
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('timed out');
                });
        });

    });

});
