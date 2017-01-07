import { IntegerField, TextField, DateField } from '../../fields';
import { ModelValidationResult, validateAgainstMeta } from '../validation';
import { ModelOperation } from '../index';
import { IModelMeta, initialiseMeta } from '../meta';
import { VALIDATION_MESSAGES as msg } from '../../fields/validationmsg';

import { expect } from 'chai';
import * as sinon from 'sinon';

describe('rev.model.validation', () => {

    describe('ValidationResult - constructor()', () => {

        it('sets up an empty result as expected', () => {
            let valid = new ModelValidationResult();
            expect(valid.valid).to.equal(true);
            expect(valid.fieldErrors).to.deep.equal({});
            expect(valid.modelErrors).to.deep.equal([]);
            expect(valid.validationFinished).to.equal(true);
        });

        it('creates a valid result when valid is true', () => {
            let valid = new ModelValidationResult(true);
            expect(valid.valid).to.equal(true);
        });

        it('creates an invalid result when valid is false', () => {
            let valid = new ModelValidationResult(false);
            expect(valid.valid).to.equal(false);
        });

        it('throws an error when valid is not a boolean', () => {
            expect(() => {
                new ModelValidationResult(<any> 'flibble');
            }).to.throw('must be a boolean');
        });

    });

    describe('ValidationResult - addFieldError()', () => {

        let valid: ModelValidationResult;

        beforeEach(() => {
            valid = new ModelValidationResult();
        });

        it('adds a fieldError with no message', () => {
            valid.addFieldError('name');
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: undefined
                }]
            });
        });

        it('adds a fieldError with specified message', () => {
            valid.addFieldError('name', 'That name is too silly!');
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'That name is too silly!'
                }]
            });
        });

        it('adds a fieldError with message and data', () => {
            valid.addFieldError('name', 'fail', {type: 'silly'});
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'fail',
                    type: 'silly'
                }]
            });
        });

        it('adds a separate key for other fields', () => {
            valid.addFieldError('name', 'fail', {type: 'silly'});
            valid.addFieldError('age', 'Old is not an age');
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'fail',
                    type: 'silly'
                }],
                age: [{
                    message: 'Old is not an age'
                }]
            });
        });

        it('adds a second fieldError with no message', () => {
            valid.addFieldError('name', 'Silly!');
            valid.addFieldError('name');
            expect(valid.fieldErrors).to.deep.equal({
                name: [
                    {
                        message: 'Silly!'
                    },
                    {
                        message: undefined
                    }
                ]
            });
        });

        it('adds a second fieldError with specified message', () => {
            valid.addFieldError('name', 'Silly!');
            valid.addFieldError('name', 'Seems like a fake name');
            expect(valid.fieldErrors).to.deep.equal({
                name: [
                    {
                        message: 'Silly!'
                    },
                    {
                        message: 'Seems like a fake name'
                    }
                ]
            });
        });

        it('adds a second fieldError with message and data', () => {
            valid.addFieldError('name', 'Silly!');
            valid.addFieldError('name', 'fail', {type: 'epic'});
            expect(valid.fieldErrors).to.deep.equal({
                name: [
                    {
                        message: 'Silly!'
                    },
                    {
                        message: 'fail',
                        type: 'epic'
                    }
                ]
            });
        });

        it('sets valid to false when error is added', () => {
            expect(valid.valid).to.equal(true);
            valid.addFieldError('name', 'fail');
            expect(valid.valid).to.equal(false);
        });

        it('throws an error when fieldName is not specified', () => {
            expect(() => {
                valid.addFieldError(undefined);
            }).to.throw('You must specify fieldName');
        });

        it('throws an error if data is not an object', () => {
            expect(() => {
                valid.addFieldError('age', 'you are too old', 94);
            }).to.throw('You cannot add non-object data');
        });

    });

    describe('ValidationResult - addModelError()', () => {

        let valid: ModelValidationResult;

        beforeEach(() => {
            valid = new ModelValidationResult();
        });

        it('adds a modelError with specified message', () => {
            valid.addModelError('Model is not cool for cats.');
            expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Model is not cool for cats.'
                }
            ]);
        });

        it('adds a modelError with message and data', () => {
            valid.addModelError('Model is not cool for cats.', {cool: 'dogs'});
            expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Model is not cool for cats.',
                    cool: 'dogs'
                }
            ]);
        });

        it('adds a second modelError with specified message', () => {
            valid.addModelError('Silly model!');
            valid.addModelError('This model has performed an illegal operation.');
            expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Silly model!'
                },
                {
                    message: 'This model has performed an illegal operation.'
                }
            ]);
        });

        it('adds a second modelError with message and data', () => {
            valid.addModelError('Silly model!');
            valid.addModelError('E-roar', {data: 42});
            expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Silly model!'
                },
                {
                    message: 'E-roar',
                    data: 42
                }
            ]);
        });

        it('sets valid to false when error is added', () => {
            expect(valid.valid).to.equal(true);
            valid.addModelError('fail!');
            expect(valid.valid).to.equal(false);
        });

        it('throws an error when no message is specified', () => {
            expect(() => {
                valid.addModelError(undefined);
            }).to.throw('You must specify a message for a model error');
        });

        it('throws an error if data is not an object', () => {
            expect(() => {
                valid.addModelError('You are too old', 94);
            }).to.throw('You cannot add non-object data');
        });

    });

    describe('validateAgainstMeta()', () => {

        class TestModel {
            id: number;
            name: string;
            date: Date;
        }

        let meta: IModelMeta<TestModel> = {
            fields: [
                new IntegerField('id', 'Id', { minValue: 10 }),
                new TextField('name', 'Name'),
                new DateField('date', 'Date', { required: false })
            ],
            validate: <sinon.SinonSpy> null,
            validateAsync: <sinon.SinonStub> null
        };

        initialiseMeta(TestModel, meta);

        it('should return a valid result if valid object is passed', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            return validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    expect(res.valid).to.equal(true);
                });
        });

        it('should return a valid result if valid object is passed and model validators are used', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            meta.validate = sinon.spy();
            meta.validateAsync = sinon.stub().returns(Promise.resolve());

            return validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    expect(res.valid).to.equal(true);
                    expect((<any> meta.validate).callCount).to.equal(1);
                    expect((<any> meta.validateAsync).callCount).to.equal(1);
                });
        });

        it('should reject if a model instance is not passed', () => {
            let test: any = () => {};

            return validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    expect(false, 'Did not reject').to.be.true;
                })
                .catch((err) => {
                    expect(err.message).to.contain('not a model instance');
                });
        });

        it('should reject if un-initialised metadata is passed', () => {
            let test = new TestModel();
            let uninitialisedMeta: IModelMeta<TestModel> = {
                fields: [
                    new IntegerField('id', 'Id', { minValue: 10 }),
                    new TextField('name', 'Name'),
                    new DateField('date', 'Date', { required: false })
                ]
            };

            return validateAgainstMeta(test, uninitialisedMeta, 'create')
                .then((res) => {
                    expect(false, 'Did not reject').to.be.true;
                })
                .catch((err) => {
                    expect(err.message).to.contain('metadata has not been initialised');
                });
        });

        it('should return an invalid result if extra fields are present', () => {

            let test = <any> new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();
            test.extra = 'stuff';

            return validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    expect(res.valid).to.equal(false);
                    expect(res.modelErrors.length).to.equal(1);
                    expect(res.modelErrors[0]['message']).to.equal(msg.extra_field('extra'));
                    expect(res.modelErrors[0]['validator']).to.equal('extra_field');
                });
        });

        it('should return an invalid result if a field value is invalid', () => {

            let test = new TestModel();
            test.id = 2;
            test.name = 'Harry';
            test.date = new Date();

            return validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    expect(res.valid).to.equal(false);
                    expect(res.fieldErrors['id'].length).to.equal(1);
                    expect(res.fieldErrors['id'][0]['message']).to.equal(msg.min_value('Id', 10));
                    expect(res.fieldErrors['id'][0]['validator']).to.equal('min_value');
                });
        });

        it('should return an invalid result if a required field is not set', () => {

            let test = new TestModel();
            test.id = 11;

            return validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    expect(res.valid).to.equal(false);
                    expect(res.fieldErrors['name'].length).to.equal(1);
                    expect(res.fieldErrors['name'][0]['message']).to.equal(msg.required('Name'));
                    expect(res.fieldErrors['name'][0]['validator']).to.equal('required');
                });
        });

        it('should return an invalid result if meta validate() fails', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            meta.validate = (model: TestModel, mode: ModelOperation, result: ModelValidationResult) => {
                result.addFieldError('name', 'That name is too stupid!', { stupidityLevel: 10 });
            };

            return validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    meta.validate = undefined;
                    expect(res.valid).to.equal(false);
                    expect(res.fieldErrors['name'].length).to.equal(1);
                    expect(res.fieldErrors['name'][0]['message']).to.equal('That name is too stupid!');
                    expect(res.fieldErrors['name'][0]['stupidityLevel']).to.equal(10);
                });
        });

        it('should return an invalid result if meta validateAsync() fails', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            meta.validateAsync = (model: TestModel, mode: ModelOperation, result: ModelValidationResult) => {
                return new Promise<void>((resolve, reject) => {
                    result.addFieldError('name', 'Google says that name is stupid', { stupidRank: 99 });
                    resolve();
                });
            };

            return validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    meta.validateAsync = undefined;
                    expect(res.valid).to.equal(false);
                    expect(res.fieldErrors['name'].length).to.equal(1);
                    expect(res.fieldErrors['name'][0]['message']).to.equal('Google says that name is stupid');
                    expect(res.fieldErrors['name'][0]['stupidRank']).to.equal(99);
                });
        });

        it('should reject if validation timeout expires', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            meta.validateAsync = (model: TestModel, mode: ModelOperation, result: ModelValidationResult) => {
                return new Promise<void>((resolve, reject) => {
                    setTimeout(() => {
                        resolve();
                    }, 10000);
                });
            };

            return validateAgainstMeta(test, meta, 'create', { timeout: 10})
                .then((res) => {
                    expect(false, 'Did not reject').to.be.true;
                })
                .catch((err) => {
                    expect(err.message).to.contain('timed out');
                });
        });

    });

});
