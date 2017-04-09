
import { expect } from 'chai';
import * as rewire from 'rewire';

import { Model } from '../../models/model';
import * as d from '../../decorators';
import * as remove from '../remove';
import { MockBackend } from './mock-backend';
import { initialiseMeta } from '../../models/meta';

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

    let whereClause = {}; // where-clause stuff TO DO!

    beforeEach(() => {
        mockBackend = new MockBackend();
        rwRemove.__set__('backends', {
            get: () => mockBackend
        });
    });

    it('calls backend.remove() and returns successful result if model is valid', () => {
        return rwRemove.remove(TestModel, whereClause)
            .then((res) => {
                expect(mockBackend.removeStub.callCount).to.equal(1);
                let removeCall = mockBackend.removeStub.getCall(0);
                expect(removeCall.args[0]).to.equal(TestModel);
                expect(removeCall.args[1]).to.equal(whereClause);
                expect(res.success).to.be.true;
            });
    });

    it('rejects if passed model is not a model constructor', () => {
        let model: any = {};
        return expect(rwRemove.remove(model, whereClause))
            .to.be.rejectedWith('not a model constructor');
    });

    it('rejects if registry.getMeta fails (e.g. model not registered)', () => {
        class UnregisteredModel extends Model {}
        return expect(rwRemove.remove(UnregisteredModel, whereClause))
            .to.be.rejectedWith('MetadataError');
    });

    it('rejects if backends.get fails (e.g. invalid backend specified)', () => {
        let expectedError = new Error('epic fail!');
        rwRemove.__set__('backends', {
            get: () => { throw expectedError; }
        });
        return expect(rwRemove.remove(TestModel, whereClause))
            .to.be.rejectedWith(expectedError);
    });

    it('rejects if where clause is not specified', () => {
        return expect(rwRemove.remove(TestModel))
            .to.be.rejectedWith('remove() must be called with a where clause');
    });

    it('rejects when model is a singleton', () => {
        class SingletonModel extends Model {
            @d.TextField() name: string;
        }
        SingletonModel.meta = {
            singleton: true
        };
        initialiseMeta(SingletonModel);
        return expect(rwRemove.remove(SingletonModel, whereClause))
            .to.be.rejectedWith('remove() cannot be called on singleton models');
    });

    it('returns any operation errors added by the backend', () => {
        mockBackend.errorsToAdd = ['error_from_backend'];
        return rwRemove.remove(TestModel, whereClause)
            .then((res) => {
                expect(res.success).to.be.false;
                expect(res.errors.length).to.equal(1);
                expect(res.errors[0].message).to.equal('error_from_backend');
            });
    });

    it('rejects when backend.remove rejects', () => {
        let expectedError = new Error('epic fail!');
        mockBackend.removeStub.returns(Promise.reject(expectedError));
        return expect(rwRemove.remove(TestModel, whereClause))
            .to.be.rejectedWith(expectedError);
    });

});
