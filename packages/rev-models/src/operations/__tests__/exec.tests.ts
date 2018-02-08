
import { expect } from 'chai';
import rewire = require('rewire');
import * as sinon from 'sinon';

import * as d from '../../decorators';
import * as exec from '../exec';
import { MockBackend } from './mock-backend';
import { ModelManager } from '../../models/manager';
import { ModelOperationResult } from '../operationresult';
import { IExecOptions } from '../../models/types';

class TestModel {
    @d.TextField({ required: true })
        name: string;

    testMethod(argObj: any, result: ModelOperationResult<this, any>): any {
        return `name: ${this.name}, argObj: ${JSON.stringify(argObj)}`;
    }

}

class TestModel2 {
    @d.TextField({ required: false  })
        name: string;

    testMethod(argObj: any, result: ModelOperationResult<this, any>): any {
        return `name: ${this.name}, argObj: ${JSON.stringify(argObj)}`;
    }
}

class UnregisteredModel {}

let rewired = rewire('../exec');
let rwExec: typeof exec & typeof rewired = rewired as any;
let mockBackend: MockBackend;
let manager: ModelManager;

describe('rev.operations.exec()', () => {

    let callSpy: sinon.SinonSpy;
    const testArgs = { someArg: 1 };
    const options: IExecOptions = {
        method: 'testMethod',
        args: testArgs
    };

    beforeEach(() => {
        callSpy = sinon.spy();
        mockBackend = new MockBackend();
        manager = new ModelManager();
        manager.registerBackend('default', mockBackend);
        manager.register(TestModel);
    });

    describe('validation', () => {

        it('rejects when model is not an object', () => {
            return rwExec.exec(manager, 'test' as any, options)
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('Specified model is not a Model instance');
                });
        });

        it('rejects when method is not a string', () => {
            let model = new TestModel();
            return rwExec.exec(manager, model, { method: 22 as any })
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('Specified method name is not valid');
                });
        });

        it('rejects if model is not registered', () => {
            let model = new UnregisteredModel();
            return rwExec.exec(manager, model, options)
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('is not registered');
                });
        });

        it('does not reject if model meta.stored is false', () => {
            manager.register(TestModel2, { stored: false });
            let model = new TestModel2();
            return rwExec.exec(manager, model, options);
        });

    });

    describe('synchronous model methods', () => {

        it('calls model method when it exists and passes IMethodContext', () => {
            let model = new TestModel();
            model.name = 'Joe';
            model.testMethod = callSpy;
            return rwExec.exec(manager, model, options)
                .then((res) => {
                    expect(callSpy.callCount).to.equal(1);
                    expect(callSpy.args[0][0]).to.deep.equal({
                        manager: manager,
                        args: testArgs,
                        result: res,
                        options
                    });
                    expect(mockBackend.execStub.callCount).to.equal(0);
                });
        });

        it('throws if model method is not a function', () => {
            let model = new TestModel();
            model.name = 'Joe';
            model.testMethod = 'oh deary me' as any;
            return rwExec.exec(manager, model, options)
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.equal('TestModel.testMethod is not a function');
                });
        });

        it('when no result is returned, a successful operationResult is returned', () => {
            let model = new TestModel();
            model.name = 'Joe';
            model.testMethod = () => undefined;
            return rwExec.exec(manager, model, options)
                .then((res) => {
                    expect(res).to.be.instanceof(ModelOperationResult);
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                });
        });

        it('when a plain result is returned, it is wrapped in an operationResult', () => {
            let model = new TestModel();
            model.name = 'Joe';
            model.testMethod = () => 'gerrald';
            return rwExec.exec(manager, model, options)
                .then((res) => {
                    expect(res).to.be.instanceof(ModelOperationResult);
                    expect(res.success).to.be.true;
                    expect(res.result).to.equal('gerrald');
                });
        });

        it('when a ModelOperationResult is returned, it is passed on', () => {
            let model = new TestModel();
            model.name = 'Joe';
            model.testMethod = (mc: exec.IMethodContext<any>) => {
                mc.result.addError('oh noes!');
                mc.result.result = 'some custom result';
                return mc.result;
            };
            return rwExec.exec(manager, model, options)
                .then((res) => {
                    expect(res).to.be.instanceof(ModelOperationResult);
                    expect(res.success).to.be.false;
                    expect(res.result).to.equal('some custom result');
                });
        });

        it('rejects if a synchronous error occurs', () => {
            let model = new TestModel();
            model.name = 'Joe';
            model.testMethod = () => {
                throw new Error('sync error');
            };
            return rwExec.exec(manager, model, options)
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('sync error');
                    expect(mockBackend.execStub.callCount).to.equal(0);
                });
        });
    });

    describe('asynchronous model methods', () => {

        it('when no result is returned, a successful operationResult is returned', () => {
            let model = new TestModel();
            model.name = 'Joe';
            model.testMethod = () => Promise.resolve();
            return rwExec.exec(manager, model, options)
                .then((res) => {
                    expect(res).to.be.instanceof(ModelOperationResult);
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                });
        });

        it('when a plain result is returned, it is wrapped in an operationResult', () => {
            let model = new TestModel();
            model.name = 'Joe';
            model.testMethod = () => Promise.resolve('gerrald');
            return rwExec.exec(manager, model, options)
                .then((res) => {
                    expect(res).to.be.instanceof(ModelOperationResult);
                    expect(res.success).to.be.true;
                    expect(res.result).to.equal('gerrald');
                });
        });

        it('when a ModelOperationResult is returned, it is passed on', () => {
            let model = new TestModel();
            model.name = 'Joe';
            model.testMethod = (mc: exec.IMethodContext<any>) => {
                mc.result.addError('oh noes!');
                mc.result.result = 'some custom result';
                return Promise.resolve(mc.result);
            };
            return rwExec.exec(manager, model, options)
                .then((res) => {
                    expect(res).to.be.instanceof(ModelOperationResult);
                    expect(res.success).to.be.false;
                    expect(res.result).to.equal('some custom result');
                });
        });

        it('rejects if model method rejects', () => {
            let model = new TestModel();
            model.name = 'Joe';
            model.testMethod = () => Promise.reject(new Error('async error'));
            return rwExec.exec(manager, model, options)
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('async error');
                    expect(mockBackend.execStub.callCount).to.equal(0);
                });
        });

    });

    describe('backend methods', () => {

        it('if model does not contain method, backend.exec() is called instead', () => {
            let model = new TestModel();
            model.name = 'Joe';
            return rwExec.exec(manager, model, { method: 'methodOnlyInBackend' })
                .then(() => {
                    expect(mockBackend.execStub.callCount).to.equal(1);
                    let execCall = mockBackend.execStub.getCall(0);
                    expect(execCall.args[0]).to.equal(manager);
                    expect(execCall.args[1]).to.equal(model);
                    expect(execCall.args[2]).to.deep.equal({ method: 'methodOnlyInBackend' });
                    expect(execCall.args[3]).to.be.instanceof(ModelOperationResult);
                });
        });

    });

});
