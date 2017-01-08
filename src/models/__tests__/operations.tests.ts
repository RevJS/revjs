import { ModelOperationResult } from '../operations';
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
    let ops: typeof operations & typeof rwOps = <any> rwOps;
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

    beforeEach(() => {
        testMeta = {
            fields: [
                new TextField('name', 'Name'),
                new SelectionField('gender', 'Gender', GENDERS),
                new IntegerField('age', 'Age', { required: false, minValue: 10 }),
                new EmailField('email', 'E-mail', { required: false })
            ]
        };
        initialiseMeta(TestModel, testMeta);

        storageSpy = {
            create: sinon.spy((model: any, meta: any, result: any) => {
                return Promise.resolve();
            }),
            read: sinon.spy((model: any, meta: any, where: any, result: any) => {
                return Promise.resolve();
            }),
            update: sinon.spy((model: any, meta: any, where: any, result: any) => {
                return Promise.resolve();
            }),
            remove: sinon.spy((model: any, meta: any, where: any, result: any) => {
                return Promise.resolve();
            })
        };
    });

    describe('ModelOperationResult - constructor()', () => {

        it('sets up an empty result as expected', () => {
            let res = new ModelOperationResult('create');
            expect(res.success).to.equal(true);
            expect(res.operation).to.equal('create');
            expect(res.errors).to.deep.equal([]);
            expect(res.validation).to.be.null;
            expect(res.result).to.be.null;
            expect(res.results).to.be.null;
        });

    });

    describe('ModelOperationResult - addError()', () => {

        let res: ModelOperationResult<{}>;

        beforeEach(() => {
            res = new ModelOperationResult('create');
        });

        it('adds an error with specified message', () => {
            res.addError('The database has exploded!');
            expect(res.errors).to.deep.equal([
                {
                    message: 'The database has exploded!'
                }
            ]);
        });

        it('adds an error with message and data', () => {
            res.addError('The database has exploded!', {dbms: 'SQL Server'});
            expect(res.errors).to.deep.equal([
                {
                    message: 'The database has exploded!',
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
            res.addError('E-roar', {data: 42});
            expect(res.errors).to.deep.equal([
                {
                    message: 'Silly operation!'
                },
                {
                    message: 'E-roar',
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
                res.addError('Operation took too long', 1000000);
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

});
