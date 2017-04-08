
import { expect } from 'chai';
import * as rewire from 'rewire';

import { Model } from '../../models/model';
import * as d from '../../decorators';
import * as read from '../read';
import { MockBackend } from './mock-backend';
import { initialiseMeta } from '../../models/meta';

class TestModel extends Model {
    @d.TextField()
        name: string;
    @d.IntegerField()
        age: number;
}

initialiseMeta(TestModel);

let testResults = [
    new TestModel({ name: 'Test 1', age: 1 }),
    new TestModel({ name: 'Test 2', age: 2 })
];

let rewired = rewire('../read');
let rwRead: typeof read & typeof rewired = rewired as any;
let mockBackend: MockBackend;

describe('rev.operations.read()', () => {

    let whereClause = {}; // where-clause stuff TO DO!

    beforeEach(() => {
        mockBackend = new MockBackend();
        mockBackend.results = testResults;
        rwRead.__set__('backends', {
            get: () => mockBackend
        });
    });

    it('calls backend.read() and returns results', () => {
        return rwRead.read(TestModel, whereClause)
            .then((res) => {
                expect(mockBackend.readStub.callCount).to.equal(1);
                let readCall = mockBackend.readStub.getCall(0);
                expect(readCall.args[0]).to.equal(TestModel);
                expect(readCall.args[1]).to.equal(whereClause);
                expect(res.success).to.be.true;
                expect(res.results).to.equal(testResults);
                expect(res.validation).to.be.null;
            });
    });

    it('allows backend.read() to be called without a where clause', () => {
        return rwRead.read(TestModel)
            .then((res) => {
                expect(mockBackend.readStub.callCount).to.equal(1);
                let readCall = mockBackend.readStub.getCall(0);
                expect(readCall.args[0]).to.equal(TestModel);
                expect(readCall.args[1]).to.deep.equal({});
                expect(res.success).to.be.true;
                expect(res.results).to.equal(testResults);
                expect(res.validation).to.be.null;
            });
    });

    it('rejects if passed model is not a model constructor', () => {
        let model: any = {};
        return expect(rwRead.read(model, whereClause))
            .to.be.rejectedWith('not a model constructor');
    });

    it('rejects if registry.getMeta fails (e.g. model not registered)', () => {
        class UnregisteredModel extends Model {}
        return expect(rwRead.read(UnregisteredModel, whereClause))
            .to.be.rejectedWith('MetadataError');
    });

    it('rejects if model is a singleton and a where clause is specified', () => {
        class SingletonModel extends Model {
            @d.TextField() name: string;
        }
        SingletonModel.meta = {
            singleton: true
        };
        initialiseMeta(SingletonModel);
        return expect(rwRead.read(SingletonModel, whereClause))
            .to.be.rejectedWith('read() cannot be called with a where clause for singleton models');
    });

    it('rejects if backends.get fails (e.g. invalid backend specified)', () => {
        let expectedError = new Error('epic fail!');
        rwRead.__set__('backends', {
            get: () => { throw expectedError; }
        });
        return expect(rwRead.read(TestModel, whereClause))
            .to.be.rejectedWith(expectedError);
    });

    it('returns any operation errors added by the backend', () => {
        mockBackend.errorsToAdd = ['error_from_backend'];
        return rwRead.read(TestModel, whereClause)
            .then((res) => {
                expect(res.success).to.be.false;
                expect(res.errors.length).to.equal(1);
                expect(res.errors[0].message).to.equal('error_from_backend');
            });
    });

    it('rejects when backend.read rejects', () => {
        let expectedError = new Error('epic fail!');
        mockBackend.readStub.returns(Promise.reject(expectedError));
        return expect(rwRead.read(TestModel, whereClause))
            .to.be.rejectedWith(expectedError);
    });

});
