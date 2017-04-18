
import { expect } from 'chai';
import * as rewire from 'rewire';

import { Model } from '../../models/model';
import * as d from '../../decorators';
import * as remove from '../remove';
import { MockBackend } from './mock-backend';
import { initialiseMeta } from '../../models/meta';
import { DEFAULT_REMOVE_OPTIONS, IRemoveOptions } from '../remove';

class TestModel extends Model {
    @d.TextField()
        name: string;
    @d.IntegerField()
        age: number;
}

initialiseMeta(TestModel);

let rewired = rewire('../remove');
let rwRemove: typeof remove & typeof rewired = rewired as any;
let mockBackend: MockBackend;

describe('rev.operations.remove()', () => {

    let options: IRemoveOptions = {}; // where-clause stuff TO DO!

    beforeEach(() => {
        options = {
            where: {}
        };
        mockBackend = new MockBackend();
        rwRemove.__set__('backends', {
            get: () => mockBackend
        });
    });

    it('calls backend.remove() and returns successful result if model is valid', () => {
        return rwRemove.remove(TestModel, options)
            .then((res) => {
                expect(mockBackend.removeStub.callCount).to.equal(1);
                let removeCall = mockBackend.removeStub.getCall(0);
                expect(removeCall.args[0]).to.equal(TestModel);
                expect(removeCall.args[1]).to.equal(options.where);
                expect(res.success).to.be.true;
            });
    });

    it('calls backend.read() with DEFAULT_REMOVE_OPTIONS if no options are set', () => {
        let testOpts = Object.assign({}, DEFAULT_REMOVE_OPTIONS, options);
        return rwRemove.remove(TestModel, options)
            .then((res) => {
                expect(mockBackend.removeStub.callCount).to.equal(1);
                let removeCall = mockBackend.removeStub.getCall(0);
                expect(removeCall.args[0]).to.equal(TestModel);
                expect(removeCall.args[1]).to.deep.equal(options.where);
                expect(removeCall.args[3]).to.deep.equal(testOpts);
            });
    });

    it('calls backend.read() with overridden options if they are set', () => {
        (options as any).someKey = 10;
        return rwRemove.remove(TestModel, options)
            .then((res) => {
                expect(mockBackend.removeStub.callCount).to.equal(1);
                let removeCall = mockBackend.removeStub.getCall(0);
                expect(removeCall.args[0]).to.equal(TestModel);
                expect(removeCall.args[1]).to.deep.equal(options.where);
                expect(removeCall.args[3].someKey).to.equal(10);
            });
    });

    it('rejects if passed model is not a model constructor', () => {
        let model: any = {};
        return expect(rwRemove.remove(model, options))
            .to.be.rejectedWith('not a model constructor');
    });

    it('rejects if registry.getMeta fails (e.g. model not registered)', () => {
        class UnregisteredModel extends Model {}
        return expect(rwRemove.remove(UnregisteredModel, options))
            .to.be.rejectedWith('MetadataError');
    });

    it('rejects if backends.get fails (e.g. invalid backend specified)', () => {
        let expectedError = new Error('epic fail!');
        rwRemove.__set__('backends', {
            get: () => { throw expectedError; }
        });
        return expect(rwRemove.remove(TestModel, options))
            .to.be.rejectedWith(expectedError);
    });

    it('rejects if where clause is not specified', () => {
        return expect(rwRemove.remove(TestModel))
            .to.be.rejectedWith('remove() must be called with a where clause');
    });

    it('rejects with any operation errors added by the backend', () => {
        mockBackend.errorsToAdd = ['some_backend_error'];
        return rwRemove.remove(TestModel, options)
            .then((res) => { throw new Error('expected reject'); })
            .catch((res) => {
                expect(res).to.be.instanceof(Error);
                expect(res.result).to.exist;
                expect(res.result.success).to.be.false;
                expect(res.result.errors.length).to.equal(1);
                expect(res.result.errors[0].message).to.equal('some_backend_error');
            });
    });

    it('rejects with expected error when backend.remove rejects', () => {
        let expectedError = new Error('epic fail!');
        mockBackend.errorToThrow = expectedError;
        return expect(rwRemove.remove(TestModel, options))
            .to.be.rejectedWith(expectedError);
    });

});
