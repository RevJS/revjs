import { ModelOperationResult, IModelOperation } from '../operations';
import * as operations from '../operations';
import { OPERATION_MESSAGES as msg } from '../operationmsg';
import * as sinon from 'sinon';
import * as rewire from 'rewire';

import { expect } from 'chai';
import { IModelMeta, initialiseMeta } from '../meta';
import { IntegerField, TextField, SelectionField, EmailField } from '../../fields';
import { ModelValidationResult } from '../validation';

describe('rev.model.operations', () => {

    class TestModel {
        name: string;
        gender: string;
        age: number;
        email: string;

        constructor(name?: string) {
            if (name) {
                this.name = name;
            }
        }
    }

    let GENDERS = [
        ['male', 'Male'],
        ['female', 'Female']
    ];

    let testMeta: IModelMeta<TestModel>;

    let storageSpy: {
        create?: sinon.SinonSpy;
        read?: sinon.SinonSpy;
        update?: sinon.SinonSpy;
        remove?: sinon.SinonSpy;
    };

    let rwOps = rewire('../operations');
    let ops: typeof operations & typeof rwOps = rwOps as any;
    ops.__set__({
        registry_1: {
            registry: {
                getMeta: (modelName: string) => {
                    if (modelName != 'TestModel') {
                        throw new Error('mock_getMeta_error');
                    }
                    return testMeta;
                }
            }
        },
        storage: {
            get: (storageName: string) => {
                if (storageName != 'default') {
                    throw new Error('mock_storage_get_error');
                }
                return storageSpy;
            }
        }
    });

    let testResults: TestModel[] = [
        new TestModel('result 1'),
        new TestModel('result 2')
    ];

    beforeEach(() => {
        testMeta = {
            fields: [
                new TextField('name'),
                new SelectionField('gender', {selection: GENDERS}),
                new IntegerField('age', { required: false, minValue: 10 }),
                new EmailField('email', { required: false })
            ]
        };
        initialiseMeta(TestModel, testMeta);

        storageSpy = {
            create: sinon.spy((model: any, meta: any, result: any) => {
                return Promise.resolve();
            }),
            update: sinon.spy((model: any, meta: any, where: any, result: any) => {
                return Promise.resolve();
            }),
            remove: sinon.spy((model: any, meta: any, where: any, result: any) => {
                return Promise.resolve();
            }),
            read: sinon.spy((model: any, meta: any, where: any, result: ModelOperationResult<TestModel>) => {
                result.results = testResults;
                return Promise.resolve();
            }),
        };
    });

    describe('ModelOperationResult - constructor()', () => {

        it('sets up an empty result as expected', () => {
            let op: IModelOperation = {name: 'create'};
            let res = new ModelOperationResult(op);
            expect(res.success).to.equal(true);
            expect(res.operation).to.equal(op);
            expect(res.errors).to.deep.equal([]);
            expect(res.validation).to.be.null;
            expect(res.result).to.be.null;
            expect(res.results).to.be.null;
        });

    });

    describe('ModelOperationResult - addError()', () => {

        let res: ModelOperationResult<{}>;

        beforeEach(() => {
            res = new ModelOperationResult({name: 'create'});
        });

        it('adds an error with specified message', () => {
            res.addError('The database has exploded!');
            expect(res.errors).to.deep.equal([
                {
                    message: 'The database has exploded!'
                }
            ]);
        });

        it('adds an error with message and code', () => {
            res.addError('The database has exploded!', 'db_error');
            expect(res.errors).to.deep.equal([
                {
                    message: 'The database has exploded!',
                    code: 'db_error'
                }
            ]);
        });

        it('adds an error with message, code and data', () => {
            res.addError('The database has exploded!', 'db_error', {dbms: 'SQL Server'});
            expect(res.errors).to.deep.equal([
                {
                    message: 'The database has exploded!',
                    code: 'db_error',
                    dbms: 'SQL Server'
                }
            ]);
        });

        it('adds a second error with specified message', () => {
            res.addError('Silly operation!');
            res.addError('This function has performed an illegal operation.');
            expect(res.errors).to.deep.equal([
                {
                    message: 'Silly operation!'
                },
                {
                    message: 'This function has performed an illegal operation.'
                }
            ]);
        });

        it('adds a second modelError with message and data', () => {
            res.addError('Silly operation!');
            res.addError('E-roar', 'oh_no!', {data: 42});
            expect(res.errors).to.deep.equal([
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

        it('sets valid to false when error is added', () => {
            expect(res.success).to.equal(true);
            res.addError('fail!');
            expect(res.success).to.equal(false);
        });

        it('throws an error when no message is specified', () => {
            expect(() => {
                res.addError(undefined);
            }).to.throw('A message must be specified for the operation error');
        });

        it('throws an error if data is not an object', () => {
            expect(() => {
                res.addError('Operation took too long', 'timeout', 1000000);
            }).to.throw('You cannot add non-object data to an operation result');
        });

    });

    describe('create()', () => {

        it('calls storage.create() and returns successful result if model is valid', () => {
            let model = new TestModel();
            model.name = 'Bob';
            model.gender = 'male';
            return ops.create(model)
                .then((res) => {
                    expect(storageSpy.create.callCount).to.equal(1);
                    let createCall = storageSpy.create.getCall(0);
                    expect(createCall.args[0]).to.equal(model);
                    expect(createCall.args[1]).to.equal(testMeta);
                    expect(res.success).to.be.true;
                    expect(res.validation).to.be.instanceOf(ModelValidationResult);
                    expect(res.validation.valid).to.be.true;
                });
        });

        it('rejects if passed model is not a model instance', () => {
            let model: any = () => {};
            return expect(ops.create(model))
                .to.be.rejectedWith('not a model instance');
        });

        it('rejects if registry.getMeta fails (e.g. model not registered)', () => {
            class UnregisteredModel {}
            let model = new UnregisteredModel();
            return expect(ops.create(model))
                .to.be.rejectedWith('mock_getMeta_error');
        });

        it('rejects if storage.get fails (e.g. invalid storage specified)', () => {
            let model = new TestModel();
            testMeta.storage = 'dbase';
            return expect(ops.create(model))
                .to.be.rejectedWith('mock_storage_get_error');
        });

        it('rejects for singleton models', () => {
            let model = new TestModel();
            testMeta.singleton = true;
            return expect(ops.create(model))
                .to.be.rejectedWith('create() cannot be called on singleton models');
        });

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

        it('returns any operation errors added by the storage', () => {
            storageSpy = {
                create: sinon.spy((model: any, meta: any, result: any) => {
                    result.addError('error_from_storage');
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
                    expect(res.errors[0].message).to.equal('error_from_storage');
                });
        });

        it('rejects when storage.create rejects', () => {
            storageSpy = {
                create: sinon.spy((model: any, meta: any, result: any) => {
                    return Promise.reject(new Error('rejection_from_storage'));
                })
            };
            let model = new TestModel();
            model.name = 'Bob';
            model.gender = 'male';
            return expect(ops.create(model))
                .to.be.rejectedWith('rejection_from_storage');
        });

    });

    describe('update()', () => {

        let whereClause = {}; // where-clause stuff TO DO!

        it('calls storage.update() and returns successful result if model is valid', () => {
            let model = new TestModel();
            model.name = 'Bob';
            model.gender = 'male';
            return ops.update(model, whereClause)
                .then((res) => {
                    expect(storageSpy.update.callCount).to.equal(1);
                    let updateCall = storageSpy.update.getCall(0);
                    expect(updateCall.args[0]).to.equal(model);
                    expect(updateCall.args[1]).to.equal(testMeta);
                    expect(res.success).to.be.true;
                    expect(res.validation).to.be.instanceOf(ModelValidationResult);
                    expect(res.validation.valid).to.be.true;
                });
        });

        it('rejects if passed model is not a model instance', () => {
            let model: any = () => {};
            return expect(ops.update(model, whereClause))
                .to.be.rejectedWith('not a model instance');
        });

        it('rejects if registry.getMeta fails (e.g. model not registered)', () => {
            class UnregisteredModel {}
            let model = new UnregisteredModel();
            return expect(ops.update(model, whereClause))
                .to.be.rejectedWith('mock_getMeta_error');
        });

        it('rejects if storage.get fails (e.g. invalid storage specified)', () => {
            let model = new TestModel();
            testMeta.storage = 'dbase';
            return expect(ops.update(model, whereClause))
                .to.be.rejectedWith('mock_storage_get_error');
        });

        it('rejects when model is not a singleton and where clause is not specified', () => {
            let model = new TestModel();
            testMeta.singleton = false;
            return expect(ops.update(model))
                .to.be.rejectedWith('update() must be called with a where clause for non-singleton models');
        });

        it('completes with unsuccessful result when model required fields not set', () => {
            let model = new TestModel();
            return ops.update(model, whereClause)
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
            return ops.update(model, whereClause)
                .then((res) => {
                    expect(res.success).to.be.false;
                    expect(res.errors.length).to.equal(1);
                    expect(res.errors[0].message).to.equal(msg.failed_validation('TestModel'));
                    expect(res.errors[0]['code']).to.equal('failed_validation');
                    expect(res.validation).to.be.instanceOf(ModelValidationResult);
                    expect(res.validation.valid).to.be.false;
                });
        });

        it('returns any operation errors added by the storage', () => {
            storageSpy = {
                update: sinon.spy((model: any, meta: any, where: any, result: any) => {
                    result.addError('error_from_storage');
                    return Promise.resolve(result);
                })
            };
            let model = new TestModel();
            model.name = 'Bob';
            model.gender = 'male';
            return ops.update(model, whereClause)
                .then((res) => {
                    expect(res.success).to.be.false;
                    expect(res.errors.length).to.equal(1);
                    expect(res.errors[0].message).to.equal('error_from_storage');
                });
        });

        it('rejects when storage.update rejects', () => {
            storageSpy = {
                update: sinon.spy((model: any, meta: any, where: any, result: any) => {
                    return Promise.reject(new Error('rejection_from_storage'));
                })
            };
            let model = new TestModel();
            model.name = 'Bob';
            model.gender = 'male';
            return expect(ops.update(model, whereClause))
                .to.be.rejectedWith('rejection_from_storage');
        });

    });

    describe('remove()', () => {

        let whereClause = {}; // where-clause stuff TO DO!

        it('calls storage.remove() and returns successful result if model is valid', () => {
            return ops.remove(TestModel, whereClause)
                .then((res) => {
                    expect(storageSpy.remove.callCount).to.equal(1);
                    let removeCall = storageSpy.remove.getCall(0);
                    expect(removeCall.args[0]).to.equal(testMeta);
                    expect(removeCall.args[1]).to.equal(whereClause);
                    expect(res.success).to.be.true;
                    expect(res.validation).to.be.instanceOf(ModelValidationResult);
                    expect(res.validation.valid).to.be.true;
                });
        });

        it('rejects if passed model is not a model constructor', () => {
            let model: any = {};
            return expect(ops.remove(model, whereClause))
                .to.be.rejectedWith('not a model constructor');
        });

        it('rejects if where clause is not specified', () => {
            return expect(ops.remove(TestModel))
                .to.be.rejectedWith('remove() must be called with a where clause');
        });

        it('rejects if registry.getMeta fails (e.g. model not registered)', () => {
            class UnregisteredModel {}
            return expect(ops.remove(UnregisteredModel, whereClause))
                .to.be.rejectedWith('mock_getMeta_error');
        });

        it('rejects if storage.get fails (e.g. invalid storage specified)', () => {
            testMeta.storage = 'dbase';
            return expect(ops.remove(TestModel, whereClause))
                .to.be.rejectedWith('mock_storage_get_error');
        });

        it('rejects when model is a singleton', () => {
            testMeta.singleton = true;
            return expect(ops.remove(TestModel, whereClause))
                .to.be.rejectedWith('remove() cannot be called on singleton models');
        });

        it('completes with unsuccessful result when meta validateRemoval fails', () => {
            testMeta.validateRemoval = (operation: IModelOperation, result: ModelValidationResult) => {
                result.addModelError('Removal denied!');
            };
            return ops.remove(TestModel, whereClause)
                .then((res) => {
                    expect(res.success).to.be.false;
                    expect(storageSpy.remove.callCount).to.equal(0);
                    expect(res.errors.length).to.equal(1);
                    expect(res.errors[0].message).to.equal(msg.failed_validation('TestModel'));
                    expect(res.errors[0]['code']).to.equal('failed_validation');
                    expect(res.validation).to.be.instanceOf(ModelValidationResult);
                    expect(res.validation.valid).to.be.false;
                    expect(res.validation.modelErrors.length).to.equal(1);
                    expect(res.validation.modelErrors[0].message).to.equal('Removal denied!');
                });
        });

        it('completes with unsuccessful result when meta validateRemovalAsync fails', () => {
            testMeta.validateRemovalAsync = (operation: IModelOperation, result: ModelValidationResult) => {
                return new Promise<void>((resolve, reject) => {
                    result.addModelError('Removal denied!');
                    resolve();
                });
            };
            return ops.remove(TestModel, whereClause)
                .then((res) => {
                    expect(res.success).to.be.false;
                    expect(storageSpy.remove.callCount).to.equal(0);
                    expect(res.errors.length).to.equal(1);
                    expect(res.errors[0].message).to.equal(msg.failed_validation('TestModel'));
                    expect(res.errors[0]['code']).to.equal('failed_validation');
                    expect(res.validation).to.be.instanceOf(ModelValidationResult);
                    expect(res.validation.valid).to.be.false;
                    expect(res.validation.modelErrors.length).to.equal(1);
                    expect(res.validation.modelErrors[0].message).to.equal('Removal denied!');
                });
        });

        it('returns any operation errors added by the storage', () => {
            storageSpy = {
                remove: sinon.spy((meta: any, where: any, result: any) => {
                    result.addError('error_from_storage');
                    return Promise.resolve(result);
                })
            };
            return ops.remove(TestModel, whereClause)
                .then((res) => {
                    expect(res.success).to.be.false;
                    expect(res.errors.length).to.equal(1);
                    expect(res.errors[0].message).to.equal('error_from_storage');
                });
        });

        it('rejects when storage.remove rejects', () => {
            storageSpy = {
                remove: sinon.spy((meta: any, where: any, result: any) => {
                    return Promise.reject(new Error('rejection_from_storage'));
                })
            };
            return expect(ops.remove(TestModel, whereClause))
                .to.be.rejectedWith('rejection_from_storage');
        });

    });

    describe('read()', () => {

        let whereClause = {}; // where-clause stuff TO DO!

        it('calls storage.read() and returns results', () => {
            return ops.read(TestModel, whereClause)
                .then((res) => {
                    expect(storageSpy.read.callCount).to.equal(1);
                    let readCall = storageSpy.read.getCall(0);
                    expect(readCall.args[0]).to.equal(TestModel);
                    expect(readCall.args[1]).to.equal(testMeta);
                    expect(readCall.args[2]).to.equal(whereClause);
                    expect(res.success).to.be.true;
                    expect(res.results).to.equal(testResults);
                    expect(res.validation).to.be.null;
                });
        });

        it('allows storage.read() to be called without a where clause', () => {
            return ops.read(TestModel)
                .then((res) => {
                    expect(storageSpy.read.callCount).to.equal(1);
                    let readCall = storageSpy.read.getCall(0);
                    expect(readCall.args[0]).to.equal(TestModel);
                    expect(readCall.args[1]).to.equal(testMeta);
                    expect(readCall.args[2]).to.deep.equal({});
                    expect(res.success).to.be.true;
                    expect(res.results).to.equal(testResults);
                    expect(res.validation).to.be.null;
                });
        });

        it('rejects if passed model is not a model constructor', () => {
            let model: any = {};
            return expect(ops.read(model, whereClause))
                .to.be.rejectedWith('not a model constructor');
        });

        it('rejects if registry.getMeta fails (e.g. model not registered)', () => {
            class UnregisteredModel {}
            return expect(ops.read(UnregisteredModel, whereClause))
                .to.be.rejectedWith('mock_getMeta_error');
        });

        it('rejects if model is a singleton and a where clause is specified', () => {
            testMeta.singleton = true;
            return expect(ops.read(TestModel, whereClause))
                .to.be.rejectedWith('read() cannot be called with a where clause for singleton models');
        });

        it('rejects if storage.get fails (e.g. invalid storage specified)', () => {
            testMeta.storage = 'dbase';
            return expect(ops.read(TestModel, whereClause))
                .to.be.rejectedWith('mock_storage_get_error');
        });

        it('returns any operation errors added by the storage', () => {
            storageSpy = {
                read: sinon.spy((model: any, meta: any, where: any, result: any) => {
                    result.addError('error_from_storage');
                    return Promise.resolve(result);
                })
            };
            return ops.read(TestModel, whereClause)
                .then((res) => {
                    expect(res.success).to.be.false;
                    expect(res.errors.length).to.equal(1);
                    expect(res.errors[0].message).to.equal('error_from_storage');
                });
        });

        it('rejects when storage.read rejects', () => {
            storageSpy = {
                read: sinon.spy((model: any, meta: any, where: any, result: any) => {
                    return Promise.reject(new Error('rejection_from_storage'));
                })
            };
            return expect(ops.read(TestModel, whereClause))
                .to.be.rejectedWith('rejection_from_storage');
        });

    });

});
