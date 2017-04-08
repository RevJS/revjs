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

    let testMeta: IModelMeta;

    let backendSpy: {
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
        backends: {
            get: (backendName: string) => {
                if (backendName != 'default') {
                    throw new Error('mock_backend_get_error');
                }
                return backendSpy;
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

        backendSpy = {
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

    describe('remove()', () => {

        let whereClause = {}; // where-clause stuff TO DO!

        it('calls backend.remove() and returns successful result if model is valid', () => {
            return ops.remove(TestModel, whereClause)
                .then((res) => {
                    expect(backendSpy.remove.callCount).to.equal(1);
                    let removeCall = backendSpy.remove.getCall(0);
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

        it('rejects if backends.get fails (e.g. invalid backend specified)', () => {
            testMeta.backend = 'dbase';
            return expect(ops.remove(TestModel, whereClause))
                .to.be.rejectedWith('mock_backend_get_error');
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
                    expect(backendSpy.remove.callCount).to.equal(0);
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
                    expect(backendSpy.remove.callCount).to.equal(0);
                    expect(res.errors.length).to.equal(1);
                    expect(res.errors[0].message).to.equal(msg.failed_validation('TestModel'));
                    expect(res.errors[0]['code']).to.equal('failed_validation');
                    expect(res.validation).to.be.instanceOf(ModelValidationResult);
                    expect(res.validation.valid).to.be.false;
                    expect(res.validation.modelErrors.length).to.equal(1);
                    expect(res.validation.modelErrors[0].message).to.equal('Removal denied!');
                });
        });

        it('returns any operation errors added by the backend', () => {
            backendSpy = {
                remove: sinon.spy((meta: any, where: any, result: any) => {
                    result.addError('error_from_backend');
                    return Promise.resolve(result);
                })
            };
            return ops.remove(TestModel, whereClause)
                .then((res) => {
                    expect(res.success).to.be.false;
                    expect(res.errors.length).to.equal(1);
                    expect(res.errors[0].message).to.equal('error_from_backend');
                });
        });

        it('rejects when backend.remove rejects', () => {
            backendSpy = {
                remove: sinon.spy((meta: any, where: any, result: any) => {
                    return Promise.reject(new Error('rejection_from_backend'));
                })
            };
            return expect(ops.remove(TestModel, whereClause))
                .to.be.rejectedWith('rejection_from_backend');
        });

    });

    describe('read()', () => {

        let whereClause = {}; // where-clause stuff TO DO!

        it('calls backend.read() and returns results', () => {
            return ops.read(TestModel, whereClause)
                .then((res) => {
                    expect(backendSpy.read.callCount).to.equal(1);
                    let readCall = backendSpy.read.getCall(0);
                    expect(readCall.args[0]).to.equal(TestModel);
                    expect(readCall.args[1]).to.equal(testMeta);
                    expect(readCall.args[2]).to.equal(whereClause);
                    expect(res.success).to.be.true;
                    expect(res.results).to.equal(testResults);
                    expect(res.validation).to.be.null;
                });
        });

        it('allows backend.read() to be called without a where clause', () => {
            return ops.read(TestModel)
                .then((res) => {
                    expect(backendSpy.read.callCount).to.equal(1);
                    let readCall = backendSpy.read.getCall(0);
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

        it('rejects if backends.get fails (e.g. invalid backend specified)', () => {
            testMeta.backend = 'dbase';
            return expect(ops.read(TestModel, whereClause))
                .to.be.rejectedWith('mock_backend_get_error');
        });

        it('returns any operation errors added by the backend', () => {
            backendSpy = {
                read: sinon.spy((model: any, meta: any, where: any, result: any) => {
                    result.addError('error_from_backend');
                    return Promise.resolve(result);
                })
            };
            return ops.read(TestModel, whereClause)
                .then((res) => {
                    expect(res.success).to.be.false;
                    expect(res.errors.length).to.equal(1);
                    expect(res.errors[0].message).to.equal('error_from_backend');
                });
        });

        it('rejects when backend.read rejects', () => {
            backendSpy = {
                read: sinon.spy((model: any, meta: any, where: any, result: any) => {
                    return Promise.reject(new Error('rejection_from_backend'));
                })
            };
            return expect(ops.read(TestModel, whereClause))
                .to.be.rejectedWith('rejection_from_backend');
        });

    });

});
