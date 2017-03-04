"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var operations_1 = require("../operations");
var operationmsg_1 = require("../operationmsg");
var sinon = require("sinon");
var rewire = require("rewire");
var chai_1 = require("chai");
var meta_1 = require("../meta");
var fields_1 = require("../../fields");
var validation_1 = require("../validation");
describe('rev.model.operations', function () {
    var TestModel = (function () {
        function TestModel(name) {
            if (name) {
                this.name = name;
            }
        }
        return TestModel;
    }());
    var GENDERS = [
        ['male', 'Male'],
        ['female', 'Female']
    ];
    var testMeta;
    var storageSpy;
    var rwOps = rewire('../operations');
    var ops = rwOps;
    ops.__set__({
        registry_1: {
            registry: {
                getMeta: function (modelName) {
                    if (modelName != 'TestModel') {
                        throw new Error('mock_getMeta_error');
                    }
                    return testMeta;
                }
            }
        },
        storage: {
            get: function (storageName) {
                if (storageName != 'default') {
                    throw new Error('mock_storage_get_error');
                }
                return storageSpy;
            }
        }
    });
    var testResults = [
        new TestModel('result 1'),
        new TestModel('result 2')
    ];
    beforeEach(function () {
        testMeta = {
            fields: [
                new fields_1.TextField('name', 'Name'),
                new fields_1.SelectionField('gender', 'Gender', GENDERS),
                new fields_1.IntegerField('age', 'Age', { required: false, minValue: 10 }),
                new fields_1.EmailField('email', 'E-mail', { required: false })
            ]
        };
        meta_1.initialiseMeta(TestModel, testMeta);
        storageSpy = {
            create: sinon.spy(function (model, meta, result) {
                return Promise.resolve();
            }),
            update: sinon.spy(function (model, meta, where, result) {
                return Promise.resolve();
            }),
            remove: sinon.spy(function (model, meta, where, result) {
                return Promise.resolve();
            }),
            read: sinon.spy(function (model, meta, where, result) {
                result.results = testResults;
                return Promise.resolve();
            }),
        };
    });
    describe('ModelOperationResult - constructor()', function () {
        it('sets up an empty result as expected', function () {
            var op = { type: 'create' };
            var res = new operations_1.ModelOperationResult(op);
            chai_1.expect(res.success).to.equal(true);
            chai_1.expect(res.operation).to.equal(op);
            chai_1.expect(res.errors).to.deep.equal([]);
            chai_1.expect(res.validation).to.be.null;
            chai_1.expect(res.result).to.be.null;
            chai_1.expect(res.results).to.be.null;
        });
    });
    describe('ModelOperationResult - addError()', function () {
        var res;
        beforeEach(function () {
            res = new operations_1.ModelOperationResult({ type: 'create' });
        });
        it('adds an error with specified message', function () {
            res.addError('The database has exploded!');
            chai_1.expect(res.errors).to.deep.equal([
                {
                    message: 'The database has exploded!'
                }
            ]);
        });
        it('adds an error with message and code', function () {
            res.addError('The database has exploded!', 'db_error');
            chai_1.expect(res.errors).to.deep.equal([
                {
                    message: 'The database has exploded!',
                    code: 'db_error'
                }
            ]);
        });
        it('adds an error with message, code and data', function () {
            res.addError('The database has exploded!', 'db_error', { dbms: 'SQL Server' });
            chai_1.expect(res.errors).to.deep.equal([
                {
                    message: 'The database has exploded!',
                    code: 'db_error',
                    dbms: 'SQL Server'
                }
            ]);
        });
        it('adds a second error with specified message', function () {
            res.addError('Silly operation!');
            res.addError('This function has performed an illegal operation.');
            chai_1.expect(res.errors).to.deep.equal([
                {
                    message: 'Silly operation!'
                },
                {
                    message: 'This function has performed an illegal operation.'
                }
            ]);
        });
        it('adds a second modelError with message and data', function () {
            res.addError('Silly operation!');
            res.addError('E-roar', 'oh_no!', { data: 42 });
            chai_1.expect(res.errors).to.deep.equal([
                {
                    message: 'Silly operation!'
                },
                {
                    message: 'E-roar',
                    code: 'oh_no!',
                    data: 42
                }
            ]);
        });
        it('sets valid to false when error is added', function () {
            chai_1.expect(res.success).to.equal(true);
            res.addError('fail!');
            chai_1.expect(res.success).to.equal(false);
        });
        it('throws an error when no message is specified', function () {
            chai_1.expect(function () {
                res.addError(undefined);
            }).to.throw('A message must be specified for the operation error');
        });
        it('throws an error if data is not an object', function () {
            chai_1.expect(function () {
                res.addError('Operation took too long', 'timeout', 1000000);
            }).to.throw('You cannot add non-object data to an operation result');
        });
    });
    describe('create()', function () {
        it('calls storage.create() and returns successful result if model is valid', function () {
            var model = new TestModel();
            model.name = 'Bob';
            model.gender = 'male';
            return ops.create(model)
                .then(function (res) {
                chai_1.expect(storageSpy.create.callCount).to.equal(1);
                var createCall = storageSpy.create.getCall(0);
                chai_1.expect(createCall.args[0]).to.equal(model);
                chai_1.expect(createCall.args[1]).to.equal(testMeta);
                chai_1.expect(res.success).to.be.true;
                chai_1.expect(res.validation).to.be.instanceOf(validation_1.ModelValidationResult);
                chai_1.expect(res.validation.valid).to.be.true;
            });
        });
        it('rejects if passed model is not a model instance', function () {
            var model = function () { };
            return chai_1.expect(ops.create(model))
                .to.be.rejectedWith('not a model instance');
        });
        it('rejects if registry.getMeta fails (e.g. model not registered)', function () {
            var UnregisteredModel = (function () {
                function UnregisteredModel() {
                }
                return UnregisteredModel;
            }());
            var model = new UnregisteredModel();
            return chai_1.expect(ops.create(model))
                .to.be.rejectedWith('mock_getMeta_error');
        });
        it('rejects if storage.get fails (e.g. invalid storage specified)', function () {
            var model = new TestModel();
            testMeta.storage = 'dbase';
            return chai_1.expect(ops.create(model))
                .to.be.rejectedWith('mock_storage_get_error');
        });
        it('rejects for singleton models', function () {
            var model = new TestModel();
            testMeta.singleton = true;
            return chai_1.expect(ops.create(model))
                .to.be.rejectedWith('create() cannot be called on singleton models');
        });
        it('completes with unsuccessful result when model required fields not set', function () {
            var model = new TestModel();
            return ops.create(model)
                .then(function (res) {
                chai_1.expect(res.success).to.be.false;
                chai_1.expect(res.errors.length).to.equal(1);
                chai_1.expect(res.errors[0].message).to.equal(operationmsg_1.OPERATION_MESSAGES.failed_validation('TestModel'));
                chai_1.expect(res.errors[0]['code']).to.equal('failed_validation');
                chai_1.expect(res.validation).to.be.instanceOf(validation_1.ModelValidationResult);
                chai_1.expect(res.validation.valid).to.be.false;
            });
        });
        it('completes with unsuccessful result when model fields do not pass validation', function () {
            var model = new TestModel();
            model.name = 'Bill';
            model.gender = 'fish';
            model.age = 9;
            model.email = 'www.google.com';
            return ops.create(model)
                .then(function (res) {
                chai_1.expect(res.success).to.be.false;
                chai_1.expect(res.errors.length).to.equal(1);
                chai_1.expect(res.errors[0].message).to.equal(operationmsg_1.OPERATION_MESSAGES.failed_validation('TestModel'));
                chai_1.expect(res.errors[0]['code']).to.equal('failed_validation');
                chai_1.expect(res.validation).to.be.instanceOf(validation_1.ModelValidationResult);
                chai_1.expect(res.validation.valid).to.be.false;
            });
        });
        it('returns any operation errors added by the storage', function () {
            storageSpy = {
                create: sinon.spy(function (model, meta, result) {
                    result.addError('error_from_storage');
                    return Promise.resolve(result);
                })
            };
            var model = new TestModel();
            model.name = 'Bob';
            model.gender = 'male';
            return ops.create(model)
                .then(function (res) {
                chai_1.expect(res.success).to.be.false;
                chai_1.expect(res.errors.length).to.equal(1);
                chai_1.expect(res.errors[0].message).to.equal('error_from_storage');
            });
        });
        it('rejects when storage.create rejects', function () {
            storageSpy = {
                create: sinon.spy(function (model, meta, result) {
                    return Promise.reject(new Error('rejection_from_storage'));
                })
            };
            var model = new TestModel();
            model.name = 'Bob';
            model.gender = 'male';
            return chai_1.expect(ops.create(model))
                .to.be.rejectedWith('rejection_from_storage');
        });
    });
    describe('update()', function () {
        var whereClause = {}; // where-clause stuff TO DO!
        it('calls storage.update() and returns successful result if model is valid', function () {
            var model = new TestModel();
            model.name = 'Bob';
            model.gender = 'male';
            return ops.update(model, whereClause)
                .then(function (res) {
                chai_1.expect(storageSpy.update.callCount).to.equal(1);
                var updateCall = storageSpy.update.getCall(0);
                chai_1.expect(updateCall.args[0]).to.equal(model);
                chai_1.expect(updateCall.args[1]).to.equal(testMeta);
                chai_1.expect(res.success).to.be.true;
                chai_1.expect(res.validation).to.be.instanceOf(validation_1.ModelValidationResult);
                chai_1.expect(res.validation.valid).to.be.true;
            });
        });
        it('rejects if passed model is not a model instance', function () {
            var model = function () { };
            return chai_1.expect(ops.update(model, whereClause))
                .to.be.rejectedWith('not a model instance');
        });
        it('rejects if registry.getMeta fails (e.g. model not registered)', function () {
            var UnregisteredModel = (function () {
                function UnregisteredModel() {
                }
                return UnregisteredModel;
            }());
            var model = new UnregisteredModel();
            return chai_1.expect(ops.update(model, whereClause))
                .to.be.rejectedWith('mock_getMeta_error');
        });
        it('rejects if storage.get fails (e.g. invalid storage specified)', function () {
            var model = new TestModel();
            testMeta.storage = 'dbase';
            return chai_1.expect(ops.update(model, whereClause))
                .to.be.rejectedWith('mock_storage_get_error');
        });
        it('rejects when model is not a singleton and where clause is not specified', function () {
            var model = new TestModel();
            testMeta.singleton = false;
            return chai_1.expect(ops.update(model))
                .to.be.rejectedWith('update() must be called with a where clause for non-singleton models');
        });
        it('completes with unsuccessful result when model required fields not set', function () {
            var model = new TestModel();
            return ops.update(model, whereClause)
                .then(function (res) {
                chai_1.expect(res.success).to.be.false;
                chai_1.expect(res.errors.length).to.equal(1);
                chai_1.expect(res.errors[0].message).to.equal(operationmsg_1.OPERATION_MESSAGES.failed_validation('TestModel'));
                chai_1.expect(res.errors[0]['code']).to.equal('failed_validation');
                chai_1.expect(res.validation).to.be.instanceOf(validation_1.ModelValidationResult);
                chai_1.expect(res.validation.valid).to.be.false;
            });
        });
        it('completes with unsuccessful result when model fields do not pass validation', function () {
            var model = new TestModel();
            model.name = 'Bill';
            model.gender = 'fish';
            model.age = 9;
            model.email = 'www.google.com';
            return ops.update(model, whereClause)
                .then(function (res) {
                chai_1.expect(res.success).to.be.false;
                chai_1.expect(res.errors.length).to.equal(1);
                chai_1.expect(res.errors[0].message).to.equal(operationmsg_1.OPERATION_MESSAGES.failed_validation('TestModel'));
                chai_1.expect(res.errors[0]['code']).to.equal('failed_validation');
                chai_1.expect(res.validation).to.be.instanceOf(validation_1.ModelValidationResult);
                chai_1.expect(res.validation.valid).to.be.false;
            });
        });
        it('returns any operation errors added by the storage', function () {
            storageSpy = {
                update: sinon.spy(function (model, meta, where, result) {
                    result.addError('error_from_storage');
                    return Promise.resolve(result);
                })
            };
            var model = new TestModel();
            model.name = 'Bob';
            model.gender = 'male';
            return ops.update(model, whereClause)
                .then(function (res) {
                chai_1.expect(res.success).to.be.false;
                chai_1.expect(res.errors.length).to.equal(1);
                chai_1.expect(res.errors[0].message).to.equal('error_from_storage');
            });
        });
        it('rejects when storage.update rejects', function () {
            storageSpy = {
                update: sinon.spy(function (model, meta, where, result) {
                    return Promise.reject(new Error('rejection_from_storage'));
                })
            };
            var model = new TestModel();
            model.name = 'Bob';
            model.gender = 'male';
            return chai_1.expect(ops.update(model, whereClause))
                .to.be.rejectedWith('rejection_from_storage');
        });
    });
    describe('remove()', function () {
        var whereClause = {}; // where-clause stuff TO DO!
        it('calls storage.remove() and returns successful result if model is valid', function () {
            return ops.remove(TestModel, whereClause)
                .then(function (res) {
                chai_1.expect(storageSpy.remove.callCount).to.equal(1);
                var removeCall = storageSpy.remove.getCall(0);
                chai_1.expect(removeCall.args[0]).to.equal(testMeta);
                chai_1.expect(removeCall.args[1]).to.equal(whereClause);
                chai_1.expect(res.success).to.be.true;
                chai_1.expect(res.validation).to.be.instanceOf(validation_1.ModelValidationResult);
                chai_1.expect(res.validation.valid).to.be.true;
            });
        });
        it('rejects if passed model is not a model constructor', function () {
            var model = {};
            return chai_1.expect(ops.remove(model, whereClause))
                .to.be.rejectedWith('not a model constructor');
        });
        it('rejects if where clause is not specified', function () {
            return chai_1.expect(ops.remove(TestModel))
                .to.be.rejectedWith('remove() must be called with a where clause');
        });
        it('rejects if registry.getMeta fails (e.g. model not registered)', function () {
            var UnregisteredModel = (function () {
                function UnregisteredModel() {
                }
                return UnregisteredModel;
            }());
            return chai_1.expect(ops.remove(UnregisteredModel, whereClause))
                .to.be.rejectedWith('mock_getMeta_error');
        });
        it('rejects if storage.get fails (e.g. invalid storage specified)', function () {
            testMeta.storage = 'dbase';
            return chai_1.expect(ops.remove(TestModel, whereClause))
                .to.be.rejectedWith('mock_storage_get_error');
        });
        it('rejects when model is a singleton', function () {
            testMeta.singleton = true;
            return chai_1.expect(ops.remove(TestModel, whereClause))
                .to.be.rejectedWith('remove() cannot be called on singleton models');
        });
        it('completes with unsuccessful result when meta validateRemoval fails', function () {
            testMeta.validateRemoval = function (operation, result) {
                result.addModelError('Removal denied!');
            };
            return ops.remove(TestModel, whereClause)
                .then(function (res) {
                chai_1.expect(res.success).to.be.false;
                chai_1.expect(storageSpy.remove.callCount).to.equal(0);
                chai_1.expect(res.errors.length).to.equal(1);
                chai_1.expect(res.errors[0].message).to.equal(operationmsg_1.OPERATION_MESSAGES.failed_validation('TestModel'));
                chai_1.expect(res.errors[0]['code']).to.equal('failed_validation');
                chai_1.expect(res.validation).to.be.instanceOf(validation_1.ModelValidationResult);
                chai_1.expect(res.validation.valid).to.be.false;
                chai_1.expect(res.validation.modelErrors.length).to.equal(1);
                chai_1.expect(res.validation.modelErrors[0].message).to.equal('Removal denied!');
            });
        });
        it('completes with unsuccessful result when meta validateRemovalAsync fails', function () {
            testMeta.validateRemovalAsync = function (operation, result) {
                return new Promise(function (resolve, reject) {
                    result.addModelError('Removal denied!');
                    resolve();
                });
            };
            return ops.remove(TestModel, whereClause)
                .then(function (res) {
                chai_1.expect(res.success).to.be.false;
                chai_1.expect(storageSpy.remove.callCount).to.equal(0);
                chai_1.expect(res.errors.length).to.equal(1);
                chai_1.expect(res.errors[0].message).to.equal(operationmsg_1.OPERATION_MESSAGES.failed_validation('TestModel'));
                chai_1.expect(res.errors[0]['code']).to.equal('failed_validation');
                chai_1.expect(res.validation).to.be.instanceOf(validation_1.ModelValidationResult);
                chai_1.expect(res.validation.valid).to.be.false;
                chai_1.expect(res.validation.modelErrors.length).to.equal(1);
                chai_1.expect(res.validation.modelErrors[0].message).to.equal('Removal denied!');
            });
        });
        it('returns any operation errors added by the storage', function () {
            storageSpy = {
                remove: sinon.spy(function (meta, where, result) {
                    result.addError('error_from_storage');
                    return Promise.resolve(result);
                })
            };
            return ops.remove(TestModel, whereClause)
                .then(function (res) {
                chai_1.expect(res.success).to.be.false;
                chai_1.expect(res.errors.length).to.equal(1);
                chai_1.expect(res.errors[0].message).to.equal('error_from_storage');
            });
        });
        it('rejects when storage.remove rejects', function () {
            storageSpy = {
                remove: sinon.spy(function (meta, where, result) {
                    return Promise.reject(new Error('rejection_from_storage'));
                })
            };
            return chai_1.expect(ops.remove(TestModel, whereClause))
                .to.be.rejectedWith('rejection_from_storage');
        });
    });
    describe('read()', function () {
        var whereClause = {}; // where-clause stuff TO DO!
        it('calls storage.read() and returns results', function () {
            return ops.read(TestModel, whereClause)
                .then(function (res) {
                chai_1.expect(storageSpy.read.callCount).to.equal(1);
                var readCall = storageSpy.read.getCall(0);
                chai_1.expect(readCall.args[0]).to.equal(TestModel);
                chai_1.expect(readCall.args[1]).to.equal(testMeta);
                chai_1.expect(readCall.args[2]).to.equal(whereClause);
                chai_1.expect(res.success).to.be.true;
                chai_1.expect(res.results).to.equal(testResults);
                chai_1.expect(res.validation).to.be.null;
            });
        });
        it('allows storage.read() to be called without a where clause', function () {
            return ops.read(TestModel)
                .then(function (res) {
                chai_1.expect(storageSpy.read.callCount).to.equal(1);
                var readCall = storageSpy.read.getCall(0);
                chai_1.expect(readCall.args[0]).to.equal(TestModel);
                chai_1.expect(readCall.args[1]).to.equal(testMeta);
                chai_1.expect(readCall.args[2]).to.deep.equal({});
                chai_1.expect(res.success).to.be.true;
                chai_1.expect(res.results).to.equal(testResults);
                chai_1.expect(res.validation).to.be.null;
            });
        });
        it('rejects if passed model is not a model constructor', function () {
            var model = {};
            return chai_1.expect(ops.read(model, whereClause))
                .to.be.rejectedWith('not a model constructor');
        });
        it('rejects if registry.getMeta fails (e.g. model not registered)', function () {
            var UnregisteredModel = (function () {
                function UnregisteredModel() {
                }
                return UnregisteredModel;
            }());
            return chai_1.expect(ops.read(UnregisteredModel, whereClause))
                .to.be.rejectedWith('mock_getMeta_error');
        });
        it('rejects if model is a singleton and a where clause is specified', function () {
            testMeta.singleton = true;
            return chai_1.expect(ops.read(TestModel, whereClause))
                .to.be.rejectedWith('read() cannot be called with a where clause for singleton models');
        });
        it('rejects if storage.get fails (e.g. invalid storage specified)', function () {
            testMeta.storage = 'dbase';
            return chai_1.expect(ops.read(TestModel, whereClause))
                .to.be.rejectedWith('mock_storage_get_error');
        });
        it('returns any operation errors added by the storage', function () {
            storageSpy = {
                read: sinon.spy(function (model, meta, where, result) {
                    result.addError('error_from_storage');
                    return Promise.resolve(result);
                })
            };
            return ops.read(TestModel, whereClause)
                .then(function (res) {
                chai_1.expect(res.success).to.be.false;
                chai_1.expect(res.errors.length).to.equal(1);
                chai_1.expect(res.errors[0].message).to.equal('error_from_storage');
            });
        });
        it('rejects when storage.read rejects', function () {
            storageSpy = {
                read: sinon.spy(function (model, meta, where, result) {
                    return Promise.reject(new Error('rejection_from_storage'));
                })
            };
            return chai_1.expect(ops.read(TestModel, whereClause))
                .to.be.rejectedWith('rejection_from_storage');
        });
    });
});
