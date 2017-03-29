import { IntegerField, TextField, DateField } from '../../fields';
import { ModelValidationResult, validateModel, validateModelRemoval } from '../validation';
import { IModelOperation } from '../index';
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
                new ModelValidationResult('flibble' as any);
            }).to.throw('must be a boolean');
        });

    });

    describe('ValidationResult - addFieldError()', () => {

        let valid: ModelValidationResult;

        beforeEach(() => {
            valid = new ModelValidationResult();
        });

        it('adds a fieldError with specified message', () => {
            valid.addFieldError('name', 'That name is too silly!');
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'That name is too silly!'
                }]
            });
        });

        it('adds a fieldError with message and code', () => {
            valid.addFieldError('name', 'fail', 'bugger');
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'fail',
                    code: 'bugger'
                }]
            });
        });

        it('adds a fieldError with message, code and data', () => {
            valid.addFieldError('name', 'fail', 'bugger', {type: 'silly'});
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'fail',
                    code: 'bugger',
                    type: 'silly'
                }]
            });
        });

        it('adds a separate key for other fields', () => {
            valid.addFieldError('name', 'fail', 'bugger', {type: 'silly'});
            valid.addFieldError('age', 'Old is not an age');
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'fail',
                    code: 'bugger',
                    type: 'silly'
                }],
                age: [{
                    message: 'Old is not an age'
                }]
            });
        });

        it('adds a second fieldError with no code', () => {
            valid.addFieldError('name', 'Silly!', 'fail');
            valid.addFieldError('name', 'Silly!');
            expect(valid.fieldErrors).to.deep.equal({
                name: [
                    {
                        message: 'Silly!',
                        code: 'fail'
                    },
                    {
                        message: 'Silly!'
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
            valid.addFieldError('name', 'fail', 'bugger', {type: 'epic'});
            expect(valid.fieldErrors).to.deep.equal({
                name: [
                    {
                        message: 'Silly!'
                    },
                    {
                        message: 'fail',
                        code: 'bugger',
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
                valid.addFieldError(undefined, undefined);
            }).to.throw('You must specify fieldName');
        });

        it('throws an error if data is not an object', () => {
            expect(() => {
                valid.addFieldError('age', 'you are too old', 'fail', 94);
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

        it('adds a modelError with message and code', () => {
            valid.addModelError('Model is not cool for cats.', 'coolness');
            expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Model is not cool for cats.',
                    code: 'coolness'
                }
            ]);
        });

        it('adds a modelError with message, code and data', () => {
            valid.addModelError('Model is not cool for cats.', 'coolness', {cool: 'dogs'});
            expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Model is not cool for cats.',
                    code: 'coolness',
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
            valid.addModelError('E-roar', 'oh_no', {data: 42});
            expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Silly model!'
                },
                {
                    message: 'E-roar',
                    code: 'oh_no',
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
                valid.addModelError('You are too old', 'age', 94);
            }).to.throw('You cannot add non-object data');
        });

    });

    describe('validateModel()', () => {

        class TestModel {
            id: number;
            name: string;
            date: Date;
        }

        let meta: IModelMeta = {
            fields: [
                new IntegerField('id', { minValue: 10 }),
                new TextField('name'),
                new DateField('date', { required: false })
            ],
            validate: null as sinon.SinonSpy,
            validateAsync: null as sinon.SinonStub
        };

        initialiseMeta(TestModel, meta);

        beforeEach(() => {
            meta.validate = null;
            meta.validateAsync = null;
        });

        it('should return a valid result if valid object is passed', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            return validateModel(test, meta, {name: 'create'})
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

            return validateModel(test, meta, {name: 'create'})
                .then((res) => {
                    expect(res.valid).to.equal(true);
                    expect((meta.validate as any).callCount).to.equal(1);
                    expect((meta.validateAsync as any).callCount).to.equal(1);
                });
        });

        it('should reject if a model instance is not passed', () => {
            let test: any = () => {};

            return validateModel(test, meta, {name: 'create'})
                .then((res) => {
                    expect(false, 'Did not reject').to.be.true;
                })
                .catch((err) => {
                    expect(err.message).to.contain('not a model instance');
                });
        });

        it('should reject if un-initialised metadata is passed', () => {
            let test = new TestModel();
            let uninitialisedMeta: IModelMeta = {
                fields: [
                    new IntegerField('id', { minValue: 10 }),
                    new TextField('name'),
                    new DateField('date', { required: false })
                ]
            };

            return validateModel(test, uninitialisedMeta, {name: 'create'})
                .then((res) => {
                    expect(false, 'Did not reject').to.be.true;
                })
                .catch((err) => {
                    expect(err.message).to.contain('metadata has not been initialised');
                });
        });

        it('should reject if operation is not specified', () => {
            let test = new TestModel();
            return validateModel(test, meta, null)
                .then((res) => {
                    expect(false, 'Did not reject').to.be.true;
                })
                .catch((err) => {
                    expect(err.message).to.contain('invalid operation specified');
                });
        });

        it('should reject if operation is not a create or update', () => {
            let test = new TestModel();
            return validateModel(test, meta, {name: 'remove'})
                .then((res) => {
                    expect(false, 'Did not reject').to.be.true;
                })
                .catch((err) => {
                    expect(err.message).to.contain('invalid operation specified');
                });
        });

        it('should return an invalid result if extra fields are present', () => {

            let test = new TestModel() as any;
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();
            test.extra = 'stuff';

            return validateModel(test, meta, {name: 'create'})
                .then((res) => {
                    expect(res.valid).to.equal(false);
                    expect(res.modelErrors.length).to.equal(1);
                    expect(res.modelErrors[0]['message']).to.equal(msg.extra_field('extra'));
                    expect(res.modelErrors[0]['code']).to.equal('extra_field');
                });
        });

        it('should return an invalid result if a field value is invalid', () => {

            let test = new TestModel();
            test.id = 2;
            test.name = 'Harry';
            test.date = new Date();

            return validateModel(test, meta, {name: 'create'})
                .then((res) => {
                    expect(res.valid).to.equal(false);
                    expect(res.fieldErrors['id'].length).to.equal(1);
                    expect(res.fieldErrors['id'][0]['message']).to.equal(msg.min_value('id', 10));
                    expect(res.fieldErrors['id'][0]['code']).to.equal('min_value');
                });
        });

        it('should return an invalid result if a required field is not set', () => {

            let test = new TestModel();
            test.id = 11;

            return validateModel(test, meta, {name: 'create'})
                .then((res) => {
                    expect(res.valid).to.equal(false);
                    expect(res.fieldErrors['name'].length).to.equal(1);
                    expect(res.fieldErrors['name'][0]['message']).to.equal(msg.required('name'));
                    expect(res.fieldErrors['name'][0]['code']).to.equal('required');
                });
        });

        it('should return an invalid result if meta validate() fails', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            meta.validate = (model: TestModel, mode: IModelOperation, result: ModelValidationResult) => {
                result.addFieldError('name', 'That name is too stupid!', 'daftness', { stupidityLevel: 10 });
            };

            return validateModel(test, meta, {name: 'create'})
                .then((res) => {
                    meta.validate = undefined;
                    expect(res.valid).to.equal(false);
                    expect(res.fieldErrors['name'].length).to.equal(1);
                    expect(res.fieldErrors['name'][0]['message']).to.equal('That name is too stupid!');
                    expect(res.fieldErrors['name'][0]['code']).to.equal('daftness');
                    expect(res.fieldErrors['name'][0]['stupidityLevel']).to.equal(10);
                });
        });

        it('should reject if meta validate() throws an error', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            meta.validate = (model: TestModel, mode: IModelOperation, result: ModelValidationResult) => {
                throw new Error('Validator epic fail...');
            };

            return expect(validateModel(test, meta, {name: 'create'}))
                .to.be.rejectedWith('Validator epic fail...');
        });

        it('should return an invalid result if meta validateAsync() fails', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            meta.validateAsync = (model: TestModel, mode: IModelOperation, result: ModelValidationResult) => {
                return new Promise<void>((resolve, reject) => {
                    result.addFieldError('name', 'Google says that name is stupid', 'daftness', { stupidRank: 99 });
                    resolve();
                });
            };

            return validateModel(test, meta, {name: 'create'})
                .then((res) => {
                    meta.validateAsync = undefined;
                    expect(res.valid).to.equal(false);
                    expect(res.fieldErrors['name'].length).to.equal(1);
                    expect(res.fieldErrors['name'][0]['message']).to.equal('Google says that name is stupid');
                    expect(res.fieldErrors['name'][0]['code']).to.equal('daftness');
                    expect(res.fieldErrors['name'][0]['stupidRank']).to.equal(99);
                });
        });

        it('should reject if meta validateAsync() throws an error', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            meta.validateAsync = (model: TestModel, mode: IModelOperation, result: ModelValidationResult) => {
                throw new Error('Async Validator epic fail...');
            };

            return expect(validateModel(test, meta, {name: 'create'}))
                .to.be.rejectedWith('Async Validator epic fail...');
        });

        it('should reject if meta validateAsync() rejects', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            meta.validateAsync = (model: TestModel, mode: IModelOperation, result: ModelValidationResult) => {
                return Promise.reject(new Error('Can handle rejection...'));
            };

            return expect(validateModel(test, meta, {name: 'create'}))
                .to.be.rejectedWith('Can handle rejection...');
        });

        it('should reject if validation timeout expires', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            meta.validateAsync = (model: TestModel, mode: IModelOperation, result: ModelValidationResult) => {
                return new Promise<void>((resolve, reject) => {
                    setTimeout(() => {
                        resolve();
                    }, 10000);
                });
            };

            return validateModel(test, meta, {name: 'create'}, { timeout: 10})
                .then((res) => {
                    expect(false, 'Did not reject').to.be.true;
                })
                .catch((err) => {
                    expect(err.message).to.contain('timed out');
                });
        });

    });

    describe('validateModelRemoval()', () => {

        class TestModel {}

        let meta: IModelMeta = {
            fields: [],
            validateRemoval: null as sinon.SinonSpy,
            validateRemovalAsync: null as sinon.SinonStub
        };
        let op: IModelOperation = {
            name: 'remove',
            where: {}
        };

        initialiseMeta(TestModel, meta);

        beforeEach(() => {
            meta.validateRemoval = null;
            meta.validateRemovalAsync = null;
        });

        it('should return a valid result if removal is valid', () => {
            return validateModelRemoval(meta, op)
                .then((res) => {
                    expect(res.valid).to.equal(true);
                });
        });

        it('should return a valid result if valid object is passed and removal validators are used', () => {

            meta.validateRemoval = sinon.spy();
            meta.validateRemovalAsync = sinon.stub().returns(Promise.resolve());

            return validateModelRemoval(meta, op)
                .then((res) => {
                    expect(res.valid).to.equal(true);
                    expect((meta.validateRemoval as any).callCount).to.equal(1);
                    expect((meta.validateRemovalAsync as any).callCount).to.equal(1);
                });
        });

        it('should reject if un-initialised metadata is passed', () => {
            let uninitialisedMeta: IModelMeta = {
                fields: [
                    new IntegerField('id', { minValue: 10 }),
                    new TextField('name'),
                    new DateField('date', { required: false })
                ]
            };

            return validateModelRemoval(uninitialisedMeta, op)
                .then((res) => {
                    expect(false, 'Did not reject').to.be.true;
                })
                .catch((err) => {
                    expect(err.message).to.contain('metadata has not been initialised');
                });
        });

        it('should reject if operation is not specified', () => {
            return validateModelRemoval(meta, null)
                .then((res) => {
                    expect(false, 'Did not reject').to.be.true;
                })
                .catch((err) => {
                    expect(err.message).to.contain('invalid operation specified');
                });
        });

        it('should reject if operation is not a create or update', () => {
            return validateModelRemoval(meta, {name: 'create', where: {}})
                .then((res) => {
                    expect(false, 'Did not reject').to.be.true;
                })
                .catch((err) => {
                    expect(err.message).to.contain('invalid operation specified');
                });
        });

        it('should reject if operation where clause is not provided', () => {
            return validateModelRemoval(meta, {name: 'remove'})
                .then((res) => {
                    expect(false, 'Did not reject').to.be.true;
                })
                .catch((err) => {
                    expect(err.message).to.contain('invalid operation where clause specified');
                });
        });

        it('should return an invalid result if meta validateRemoval() fails', () => {

            meta.validateRemoval = (operation: IModelOperation, result: ModelValidationResult) => {
                result.addModelError('You are not allowed to remove this model', 'removal_error', { nope: true });
            };

            return validateModelRemoval(meta, op)
                .then((res) => {
                    expect(res.valid).to.equal(false);
                    expect(res.modelErrors.length).to.equal(1);
                    expect(res.modelErrors[0]['message']).to.equal('You are not allowed to remove this model');
                    expect(res.modelErrors[0]['code']).to.equal('removal_error');
                    expect(res.modelErrors[0]['nope']).to.equal(true);
                });
        });

        it('should reject if meta validateRemoval() throws an error', () => {

            meta.validateRemoval = (operation: IModelOperation, result: ModelValidationResult) => {
                throw new Error('Validator epic fail...');
            };

            return expect(validateModelRemoval(meta, op))
                .to.be.rejectedWith('Validator epic fail...');
        });

        it('should return an invalid result if meta validateRemovalAsync() fails', () => {

            meta.validateRemovalAsync = (operation: IModelOperation, result: ModelValidationResult) => {
                return new Promise<void>((resolve, reject) => {
                    result.addModelError('Google says you cant remove this model', 'removal_error', { denied: true });
                    resolve();
                });
            };

            return validateModelRemoval(meta, op)
                .then((res) => {
                    expect(res.valid).to.equal(false);
                    expect(res.modelErrors.length).to.equal(1);
                    expect(res.modelErrors[0]['message']).to.equal('Google says you cant remove this model');
                    expect(res.modelErrors[0]['code']).to.equal('removal_error');
                    expect(res.modelErrors[0]['denied']).to.equal(true);
                });
        });

        it('should reject if meta validateRemovalAsync() throws an error', () => {

            meta.validateRemovalAsync = (operation: IModelOperation, result: ModelValidationResult) => {
                throw new Error('Async Validator epic fail...');
            };

            return expect(validateModelRemoval(meta, op))
                .to.be.rejectedWith('Async Validator epic fail...');
        });

        it('should reject if meta validateRemovalAsync() rejects', () => {

            meta.validateRemovalAsync = (operation: IModelOperation, result: ModelValidationResult) => {
                return Promise.reject(new Error('Can handle rejection...'));
            };

            return expect(validateModelRemoval(meta, op))
                .to.be.rejectedWith('Can handle rejection...');
        });

        it('should reject if validation timeout expires', () => {

            meta.validateRemovalAsync = (operation: IModelOperation, result: ModelValidationResult) => {
                return new Promise<void>((resolve, reject) => {
                    setTimeout(() => {
                        resolve();
                    }, 10000);
                });
            };

            return expect(validateModelRemoval(meta, op, { timeout: 10}))
                .to.be.rejectedWith('timed out');
        });

    });

});
