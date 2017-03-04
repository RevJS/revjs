"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fields_1 = require("../../fields");
var validation_1 = require("../validation");
var meta_1 = require("../meta");
var validationmsg_1 = require("../../fields/validationmsg");
var chai_1 = require("chai");
var sinon = require("sinon");
describe('rev.model.validation', function () {
    describe('ValidationResult - constructor()', function () {
        it('sets up an empty result as expected', function () {
            var valid = new validation_1.ModelValidationResult();
            chai_1.expect(valid.valid).to.equal(true);
            chai_1.expect(valid.fieldErrors).to.deep.equal({});
            chai_1.expect(valid.modelErrors).to.deep.equal([]);
            chai_1.expect(valid.validationFinished).to.equal(true);
        });
        it('creates a valid result when valid is true', function () {
            var valid = new validation_1.ModelValidationResult(true);
            chai_1.expect(valid.valid).to.equal(true);
        });
        it('creates an invalid result when valid is false', function () {
            var valid = new validation_1.ModelValidationResult(false);
            chai_1.expect(valid.valid).to.equal(false);
        });
        it('throws an error when valid is not a boolean', function () {
            chai_1.expect(function () {
                new validation_1.ModelValidationResult('flibble');
            }).to.throw('must be a boolean');
        });
    });
    describe('ValidationResult - addFieldError()', function () {
        var valid;
        beforeEach(function () {
            valid = new validation_1.ModelValidationResult();
        });
        it('adds a fieldError with specified message', function () {
            valid.addFieldError('name', 'That name is too silly!');
            chai_1.expect(valid.fieldErrors).to.deep.equal({
                name: [{
                        message: 'That name is too silly!'
                    }]
            });
        });
        it('adds a fieldError with message and code', function () {
            valid.addFieldError('name', 'fail', 'bugger');
            chai_1.expect(valid.fieldErrors).to.deep.equal({
                name: [{
                        message: 'fail',
                        code: 'bugger'
                    }]
            });
        });
        it('adds a fieldError with message, code and data', function () {
            valid.addFieldError('name', 'fail', 'bugger', { type: 'silly' });
            chai_1.expect(valid.fieldErrors).to.deep.equal({
                name: [{
                        message: 'fail',
                        code: 'bugger',
                        type: 'silly'
                    }]
            });
        });
        it('adds a separate key for other fields', function () {
            valid.addFieldError('name', 'fail', 'bugger', { type: 'silly' });
            valid.addFieldError('age', 'Old is not an age');
            chai_1.expect(valid.fieldErrors).to.deep.equal({
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
        it('adds a second fieldError with no code', function () {
            valid.addFieldError('name', 'Silly!', 'fail');
            valid.addFieldError('name', 'Silly!');
            chai_1.expect(valid.fieldErrors).to.deep.equal({
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
        it('adds a second fieldError with specified message', function () {
            valid.addFieldError('name', 'Silly!');
            valid.addFieldError('name', 'Seems like a fake name');
            chai_1.expect(valid.fieldErrors).to.deep.equal({
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
        it('adds a second fieldError with message and data', function () {
            valid.addFieldError('name', 'Silly!');
            valid.addFieldError('name', 'fail', 'bugger', { type: 'epic' });
            chai_1.expect(valid.fieldErrors).to.deep.equal({
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
        it('sets valid to false when error is added', function () {
            chai_1.expect(valid.valid).to.equal(true);
            valid.addFieldError('name', 'fail');
            chai_1.expect(valid.valid).to.equal(false);
        });
        it('throws an error when fieldName is not specified', function () {
            chai_1.expect(function () {
                valid.addFieldError(undefined, undefined);
            }).to.throw('You must specify fieldName');
        });
        it('throws an error if data is not an object', function () {
            chai_1.expect(function () {
                valid.addFieldError('age', 'you are too old', 'fail', 94);
            }).to.throw('You cannot add non-object data');
        });
    });
    describe('ValidationResult - addModelError()', function () {
        var valid;
        beforeEach(function () {
            valid = new validation_1.ModelValidationResult();
        });
        it('adds a modelError with specified message', function () {
            valid.addModelError('Model is not cool for cats.');
            chai_1.expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Model is not cool for cats.'
                }
            ]);
        });
        it('adds a modelError with message and code', function () {
            valid.addModelError('Model is not cool for cats.', 'coolness');
            chai_1.expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Model is not cool for cats.',
                    code: 'coolness'
                }
            ]);
        });
        it('adds a modelError with message, code and data', function () {
            valid.addModelError('Model is not cool for cats.', 'coolness', { cool: 'dogs' });
            chai_1.expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Model is not cool for cats.',
                    code: 'coolness',
                    cool: 'dogs'
                }
            ]);
        });
        it('adds a second modelError with specified message', function () {
            valid.addModelError('Silly model!');
            valid.addModelError('This model has performed an illegal operation.');
            chai_1.expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Silly model!'
                },
                {
                    message: 'This model has performed an illegal operation.'
                }
            ]);
        });
        it('adds a second modelError with message and data', function () {
            valid.addModelError('Silly model!');
            valid.addModelError('E-roar', 'oh_no', { data: 42 });
            chai_1.expect(valid.modelErrors).to.deep.equal([
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
        it('sets valid to false when error is added', function () {
            chai_1.expect(valid.valid).to.equal(true);
            valid.addModelError('fail!');
            chai_1.expect(valid.valid).to.equal(false);
        });
        it('throws an error when no message is specified', function () {
            chai_1.expect(function () {
                valid.addModelError(undefined);
            }).to.throw('You must specify a message for a model error');
        });
        it('throws an error if data is not an object', function () {
            chai_1.expect(function () {
                valid.addModelError('You are too old', 'age', 94);
            }).to.throw('You cannot add non-object data');
        });
    });
    describe('validateModel()', function () {
        var TestModel = (function () {
            function TestModel() {
            }
            return TestModel;
        }());
        var meta = {
            fields: [
                new fields_1.IntegerField('id', 'Id', { minValue: 10 }),
                new fields_1.TextField('name', 'Name'),
                new fields_1.DateField('date', 'Date', { required: false })
            ],
            validate: null,
            validateAsync: null
        };
        meta_1.initialiseMeta(TestModel, meta);
        beforeEach(function () {
            meta.validate = null;
            meta.validateAsync = null;
        });
        it('should return a valid result if valid object is passed', function () {
            var test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();
            return validation_1.validateModel(test, meta, { type: 'create' })
                .then(function (res) {
                chai_1.expect(res.valid).to.equal(true);
            });
        });
        it('should return a valid result if valid object is passed and model validators are used', function () {
            var test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();
            meta.validate = sinon.spy();
            meta.validateAsync = sinon.stub().returns(Promise.resolve());
            return validation_1.validateModel(test, meta, { type: 'create' })
                .then(function (res) {
                chai_1.expect(res.valid).to.equal(true);
                chai_1.expect(meta.validate.callCount).to.equal(1);
                chai_1.expect(meta.validateAsync.callCount).to.equal(1);
            });
        });
        it('should reject if a model instance is not passed', function () {
            var test = function () { };
            return validation_1.validateModel(test, meta, { type: 'create' })
                .then(function (res) {
                chai_1.expect(false, 'Did not reject').to.be.true;
            })
                .catch(function (err) {
                chai_1.expect(err.message).to.contain('not a model instance');
            });
        });
        it('should reject if un-initialised metadata is passed', function () {
            var test = new TestModel();
            var uninitialisedMeta = {
                fields: [
                    new fields_1.IntegerField('id', 'Id', { minValue: 10 }),
                    new fields_1.TextField('name', 'Name'),
                    new fields_1.DateField('date', 'Date', { required: false })
                ]
            };
            return validation_1.validateModel(test, uninitialisedMeta, { type: 'create' })
                .then(function (res) {
                chai_1.expect(false, 'Did not reject').to.be.true;
            })
                .catch(function (err) {
                chai_1.expect(err.message).to.contain('metadata has not been initialised');
            });
        });
        it('should reject if operation is not specified', function () {
            var test = new TestModel();
            return validation_1.validateModel(test, meta, null)
                .then(function (res) {
                chai_1.expect(false, 'Did not reject').to.be.true;
            })
                .catch(function (err) {
                chai_1.expect(err.message).to.contain('invalid operation specified');
            });
        });
        it('should reject if operation is not a create or update', function () {
            var test = new TestModel();
            return validation_1.validateModel(test, meta, { type: 'remove' })
                .then(function (res) {
                chai_1.expect(false, 'Did not reject').to.be.true;
            })
                .catch(function (err) {
                chai_1.expect(err.message).to.contain('invalid operation specified');
            });
        });
        it('should return an invalid result if extra fields are present', function () {
            var test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();
            test.extra = 'stuff';
            return validation_1.validateModel(test, meta, { type: 'create' })
                .then(function (res) {
                chai_1.expect(res.valid).to.equal(false);
                chai_1.expect(res.modelErrors.length).to.equal(1);
                chai_1.expect(res.modelErrors[0]['message']).to.equal(validationmsg_1.VALIDATION_MESSAGES.extra_field('extra'));
                chai_1.expect(res.modelErrors[0]['code']).to.equal('extra_field');
            });
        });
        it('should return an invalid result if a field value is invalid', function () {
            var test = new TestModel();
            test.id = 2;
            test.name = 'Harry';
            test.date = new Date();
            return validation_1.validateModel(test, meta, { type: 'create' })
                .then(function (res) {
                chai_1.expect(res.valid).to.equal(false);
                chai_1.expect(res.fieldErrors['id'].length).to.equal(1);
                chai_1.expect(res.fieldErrors['id'][0]['message']).to.equal(validationmsg_1.VALIDATION_MESSAGES.min_value('Id', 10));
                chai_1.expect(res.fieldErrors['id'][0]['code']).to.equal('min_value');
            });
        });
        it('should return an invalid result if a required field is not set', function () {
            var test = new TestModel();
            test.id = 11;
            return validation_1.validateModel(test, meta, { type: 'create' })
                .then(function (res) {
                chai_1.expect(res.valid).to.equal(false);
                chai_1.expect(res.fieldErrors['name'].length).to.equal(1);
                chai_1.expect(res.fieldErrors['name'][0]['message']).to.equal(validationmsg_1.VALIDATION_MESSAGES.required('Name'));
                chai_1.expect(res.fieldErrors['name'][0]['code']).to.equal('required');
            });
        });
        it('should return an invalid result if meta validate() fails', function () {
            var test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();
            meta.validate = function (model, mode, result) {
                result.addFieldError('name', 'That name is too stupid!', 'daftness', { stupidityLevel: 10 });
            };
            return validation_1.validateModel(test, meta, { type: 'create' })
                .then(function (res) {
                meta.validate = undefined;
                chai_1.expect(res.valid).to.equal(false);
                chai_1.expect(res.fieldErrors['name'].length).to.equal(1);
                chai_1.expect(res.fieldErrors['name'][0]['message']).to.equal('That name is too stupid!');
                chai_1.expect(res.fieldErrors['name'][0]['code']).to.equal('daftness');
                chai_1.expect(res.fieldErrors['name'][0]['stupidityLevel']).to.equal(10);
            });
        });
        it('should reject if meta validate() throws an error', function () {
            var test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();
            meta.validate = function (model, mode, result) {
                throw new Error('Validator epic fail...');
            };
            return chai_1.expect(validation_1.validateModel(test, meta, { type: 'create' }))
                .to.be.rejectedWith('Validator epic fail...');
        });
        it('should return an invalid result if meta validateAsync() fails', function () {
            var test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();
            meta.validateAsync = function (model, mode, result) {
                return new Promise(function (resolve, reject) {
                    result.addFieldError('name', 'Google says that name is stupid', 'daftness', { stupidRank: 99 });
                    resolve();
                });
            };
            return validation_1.validateModel(test, meta, { type: 'create' })
                .then(function (res) {
                meta.validateAsync = undefined;
                chai_1.expect(res.valid).to.equal(false);
                chai_1.expect(res.fieldErrors['name'].length).to.equal(1);
                chai_1.expect(res.fieldErrors['name'][0]['message']).to.equal('Google says that name is stupid');
                chai_1.expect(res.fieldErrors['name'][0]['code']).to.equal('daftness');
                chai_1.expect(res.fieldErrors['name'][0]['stupidRank']).to.equal(99);
            });
        });
        it('should reject if meta validateAsync() throws an error', function () {
            var test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();
            meta.validateAsync = function (model, mode, result) {
                throw new Error('Async Validator epic fail...');
            };
            return chai_1.expect(validation_1.validateModel(test, meta, { type: 'create' }))
                .to.be.rejectedWith('Async Validator epic fail...');
        });
        it('should reject if meta validateAsync() rejects', function () {
            var test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();
            meta.validateAsync = function (model, mode, result) {
                return Promise.reject(new Error('Can handle rejection...'));
            };
            return chai_1.expect(validation_1.validateModel(test, meta, { type: 'create' }))
                .to.be.rejectedWith('Can handle rejection...');
        });
        it('should reject if validation timeout expires', function () {
            var test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();
            meta.validateAsync = function (model, mode, result) {
                return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve();
                    }, 10000);
                });
            };
            return validation_1.validateModel(test, meta, { type: 'create' }, { timeout: 10 })
                .then(function (res) {
                chai_1.expect(false, 'Did not reject').to.be.true;
            })
                .catch(function (err) {
                chai_1.expect(err.message).to.contain('timed out');
            });
        });
    });
    describe('validateModelRemoval()', function () {
        var TestModel = (function () {
            function TestModel() {
            }
            return TestModel;
        }());
        var meta = {
            fields: [],
            validateRemoval: null,
            validateRemovalAsync: null
        };
        var op = {
            type: 'remove',
            where: {}
        };
        meta_1.initialiseMeta(TestModel, meta);
        beforeEach(function () {
            meta.validateRemoval = null;
            meta.validateRemovalAsync = null;
        });
        it('should return a valid result if removal is valid', function () {
            return validation_1.validateModelRemoval(meta, op)
                .then(function (res) {
                chai_1.expect(res.valid).to.equal(true);
            });
        });
        it('should return a valid result if valid object is passed and removal validators are used', function () {
            meta.validateRemoval = sinon.spy();
            meta.validateRemovalAsync = sinon.stub().returns(Promise.resolve());
            return validation_1.validateModelRemoval(meta, op)
                .then(function (res) {
                chai_1.expect(res.valid).to.equal(true);
                chai_1.expect(meta.validateRemoval.callCount).to.equal(1);
                chai_1.expect(meta.validateRemovalAsync.callCount).to.equal(1);
            });
        });
        it('should reject if un-initialised metadata is passed', function () {
            var uninitialisedMeta = {
                fields: [
                    new fields_1.IntegerField('id', 'Id', { minValue: 10 }),
                    new fields_1.TextField('name', 'Name'),
                    new fields_1.DateField('date', 'Date', { required: false })
                ]
            };
            return validation_1.validateModelRemoval(uninitialisedMeta, op)
                .then(function (res) {
                chai_1.expect(false, 'Did not reject').to.be.true;
            })
                .catch(function (err) {
                chai_1.expect(err.message).to.contain('metadata has not been initialised');
            });
        });
        it('should reject if operation is not specified', function () {
            return validation_1.validateModelRemoval(meta, null)
                .then(function (res) {
                chai_1.expect(false, 'Did not reject').to.be.true;
            })
                .catch(function (err) {
                chai_1.expect(err.message).to.contain('invalid operation specified');
            });
        });
        it('should reject if operation is not a create or update', function () {
            return validation_1.validateModelRemoval(meta, { type: 'create', where: {} })
                .then(function (res) {
                chai_1.expect(false, 'Did not reject').to.be.true;
            })
                .catch(function (err) {
                chai_1.expect(err.message).to.contain('invalid operation specified');
            });
        });
        it('should reject if operation where clause is not provided', function () {
            return validation_1.validateModelRemoval(meta, { type: 'remove' })
                .then(function (res) {
                chai_1.expect(false, 'Did not reject').to.be.true;
            })
                .catch(function (err) {
                chai_1.expect(err.message).to.contain('invalid operation where clause specified');
            });
        });
        it('should return an invalid result if meta validateRemoval() fails', function () {
            meta.validateRemoval = function (operation, result) {
                result.addModelError('You are not allowed to remove this model', 'removal_error', { nope: true });
            };
            return validation_1.validateModelRemoval(meta, op)
                .then(function (res) {
                chai_1.expect(res.valid).to.equal(false);
                chai_1.expect(res.modelErrors.length).to.equal(1);
                chai_1.expect(res.modelErrors[0]['message']).to.equal('You are not allowed to remove this model');
                chai_1.expect(res.modelErrors[0]['code']).to.equal('removal_error');
                chai_1.expect(res.modelErrors[0]['nope']).to.equal(true);
            });
        });
        it('should reject if meta validateRemoval() throws an error', function () {
            meta.validateRemoval = function (operation, result) {
                throw new Error('Validator epic fail...');
            };
            return chai_1.expect(validation_1.validateModelRemoval(meta, op))
                .to.be.rejectedWith('Validator epic fail...');
        });
        it('should return an invalid result if meta validateRemovalAsync() fails', function () {
            meta.validateRemovalAsync = function (operation, result) {
                return new Promise(function (resolve, reject) {
                    result.addModelError('Google says you cant remove this model', 'removal_error', { denied: true });
                    resolve();
                });
            };
            return validation_1.validateModelRemoval(meta, op)
                .then(function (res) {
                chai_1.expect(res.valid).to.equal(false);
                chai_1.expect(res.modelErrors.length).to.equal(1);
                chai_1.expect(res.modelErrors[0]['message']).to.equal('Google says you cant remove this model');
                chai_1.expect(res.modelErrors[0]['code']).to.equal('removal_error');
                chai_1.expect(res.modelErrors[0]['denied']).to.equal(true);
            });
        });
        it('should reject if meta validateRemovalAsync() throws an error', function () {
            meta.validateRemovalAsync = function (operation, result) {
                throw new Error('Async Validator epic fail...');
            };
            return chai_1.expect(validation_1.validateModelRemoval(meta, op))
                .to.be.rejectedWith('Async Validator epic fail...');
        });
        it('should reject if meta validateRemovalAsync() rejects', function () {
            meta.validateRemovalAsync = function (operation, result) {
                return Promise.reject(new Error('Can handle rejection...'));
            };
            return chai_1.expect(validation_1.validateModelRemoval(meta, op))
                .to.be.rejectedWith('Can handle rejection...');
        });
        it('should reject if validation timeout expires', function () {
            meta.validateRemovalAsync = function (operation, result) {
                return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve();
                    }, 10000);
                });
            };
            return chai_1.expect(validation_1.validateModelRemoval(meta, op, { timeout: 10 }))
                .to.be.rejectedWith('timed out');
        });
    });
});
