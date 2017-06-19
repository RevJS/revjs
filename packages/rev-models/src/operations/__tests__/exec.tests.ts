
import { expect } from 'chai';
import rewire = require('rewire');
import * as sinon from 'sinon';

import { Model } from '../../models/model';
import * as d from '../../decorators';
import * as exec from '../exec';
import { MockBackend } from './mock-backend';
// import { ModelValidationResult } from '../../validation/validationresult';
import { IExecOptions } from '../exec';
import { ModelRegistry } from '../../registry/registry';

class TestModel extends Model {
    @d.TextField({ primaryKey: true })
        name: string;

    testMethod = sinon.spy();
}

class UnregisteredModel extends Model {}

let rewired = rewire('../exec');
let rwExec: typeof exec & typeof rewired = rewired as any;
let mockBackend: MockBackend;
let registry: ModelRegistry;

describe('rev.operations.exec()', () => {

    let options: IExecOptions;

    beforeEach(() => {
        options = {};
        mockBackend = new MockBackend();
        registry = new ModelRegistry();
        registry.registerBackend('default', mockBackend);
        registry.register(TestModel);
    });

    it('rejects when model is not an object', () => {
        return rwExec.exec(registry, 'test' as any, 'testMethod')
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('Specified model is not a Model instance');
            });
    });

    it('rejects when model is not an instance of Model', () => {
        let model = {test: 1};
        return rwExec.exec(registry, model as any, 'testMethod')
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('Specified model is not a Model instance');
            });
    });

    it('rejects when method is not a string', () => {
        let model = new TestModel();
        return rwExec.exec(registry, model, 22 as any)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('Specified method name is not valid');
            });
    });

    it('rejects if model is not registered', () => {
        let model = new UnregisteredModel();
        return rwExec.exec(registry, model, 'testMethod')
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('is not registered');
            });
    });

    it('needs to have more tests...', () => {
        expect('tests finished').to.equal('done');
    });

});
