
import { expect } from 'chai';
import rewire = require('rewire');

import * as d from '../../decorators';
import * as read from '../read';
import { MockBackend } from './mock-backend';
import { ModelManager } from '../../models/manager';
import { IModelMeta } from '../../models/types';

class TestRelatedModel {}

class TestModel {
    @d.TextField()
        name: string;
    @d.IntegerField()
        age: number;
    @d.RelatedModel({ model: 'TestRelatedModel' })
        related: TestRelatedModel;
}

class TestModel2 {}

let testResults = [
    new TestModel(),
    new TestModel()
];
Object.assign(testResults[0], { name: 'Test 1', age: 1 });
Object.assign(testResults[1], { name: 'Test 2', age: 2 });

let rewired = rewire('../read');
let rwRead: typeof read & typeof rewired = rewired as any;
let mockBackend: MockBackend;
let manager: ModelManager;
let testMeta: IModelMeta<TestModel>;

describe('rev.operations.read()', () => {

    let whereClause = {};

    beforeEach(() => {
        mockBackend = new MockBackend();
        mockBackend.results = testResults;
        manager = new ModelManager();
        manager.registerBackend('default', mockBackend);
        manager.register(TestModel);
    });

    it('DEFAULT_READ_OPTIONS are as expected', () => {
        expect(read.DEFAULT_READ_OPTIONS).to.deep.equal({
            limit: 20,
            offset: 0
        });
    });

    it('calls backend.read() and returns results', () => {
        return rwRead.read(manager, TestModel, whereClause)
            .then((res) => {
                expect(mockBackend.readStub.callCount).to.equal(1);
                let readCall = mockBackend.readStub.getCall(0);
                expect(readCall.args[1]).to.equal(TestModel);
                expect(readCall.args[2]).to.equal(whereClause);
                expect(res.success).to.be.true;
                expect(res.results).to.equal(testResults);
                expect(res.validation).to.be.undefined;
            });
    });

    it('calls backend.read() with a default where clause if one is not provided', () => {
        return rwRead.read(manager, TestModel)
            .then((res) => {
                expect(mockBackend.readStub.callCount).to.equal(1);
                let readCall = mockBackend.readStub.getCall(0);
                expect(readCall.args[1]).to.equal(TestModel);
                expect(readCall.args[2]).to.deep.equal({});
                expect(res.success).to.be.true;
                expect(res.results).to.equal(testResults);
                expect(res.validation).to.be.undefined;
            });
    });

    it('calls backend.read() with DEFAULT_READ_OPTIONS if no options are set', () => {
        return rwRead.read(manager, TestModel, whereClause, null)
            .then((res) => {
                expect(mockBackend.readStub.callCount).to.equal(1);
                let readCall = mockBackend.readStub.getCall(0);
                expect(readCall.args[1]).to.equal(TestModel);
                expect(readCall.args[2]).to.deep.equal({});
                expect(readCall.args[4]).to.deep.equal(read.DEFAULT_READ_OPTIONS);
            });
    });

    it('calls backend.read() with overridden options if they are set', () => {
        return rwRead.read(manager, TestModel, whereClause, { offset: 10 })
            .then((res) => {
                expect(mockBackend.readStub.callCount).to.equal(1);
                let readCall = mockBackend.readStub.getCall(0);
                expect(readCall.args[1]).to.equal(TestModel);
                expect(readCall.args[2]).to.deep.equal({});
                expect(readCall.args[4].limit).to.equal(read.DEFAULT_READ_OPTIONS.limit);
                expect(readCall.args[4].offset).to.equal(10);
            });
    });

    it('rejects if model is not registered', () => {
        return rwRead.read(manager, TestModel2)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('is not registered');
            });
    });

    it('rejects if order_by option is invalid', () => {
        return rwRead.read(manager, TestModel, whereClause, {
            order_by: ['star_sign']
        })
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain(`field 'star_sign' does not exist in model`);
            });
    });

    it('rejects if "related" option does not match a field', () => {
        return rwRead.read(manager, TestModel, whereClause, {
            related: ['flibble']
        })
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain(`field 'flibble' does not exist in model`);
            });
    });

    it('rejects if "related" option does not match a related model field', () => {
        return rwRead.read(manager, TestModel, whereClause, {
            related: ['name']
        })
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain(`field 'name' is not a relational field`);
            });
    });

    it('throws an error if options.limit == 0', () => {
        return rwRead.read(manager, TestModel, {}, {
                offset: 2,
                limit: 0
            })
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('options.limit cannot be less than 1');
            });
    });

    it('throws an error if options.limit is negative', () => {
        return rwRead.read(manager, TestModel, {}, {
                offset: 2,
                limit: -12
            })
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('options.limit cannot be less than 1');
            });
    });

    it('throws an error if options.offset is negative', () => {
        return rwRead.read(manager, TestModel, {}, {
                offset: -10,
                limit: 10
            })
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err.message).to.contain('options.offset cannot be less than zero');
            });
    });

    it('rejects with any operation errors added by the backend', () => {
        mockBackend.errorsToAdd = ['some_backend_error'];
        return rwRead.read(manager, TestModel, whereClause)
            .then((res) => { throw new Error('expected reject'); })
            .catch((res) => {
                expect(res).to.be.instanceof(Error);
                expect(res.result).to.exist;
                expect(res.result.success).to.be.false;
                expect(res.result.errors.length).to.equal(1);
                expect(res.result.errors[0].message).to.equal('some_backend_error');
            });
    });

    it('rejects with expected error when backend.read rejects', () => {
        let expectedError = new Error('epic fail!');
        mockBackend.errorToThrow = expectedError;
        return rwRead.read(manager, TestModel, whereClause)
            .then(() => { throw new Error('expected to reject'); })
            .catch((err) => {
                expect(err).to.equal(expectedError);
            });
    });

});

describe('validateOrderBy()', () => {

    beforeEach(() => {
        mockBackend = new MockBackend();
        manager = new ModelManager();
        manager.registerBackend('default', mockBackend);
        manager.register(TestModel);
        testMeta = manager.getModelMeta(TestModel);
    });

    it('does no throw when order_by is a single field', () => {
        expect(() => {
            read.validateOrderBy(TestModel, testMeta, ['name']);
        }).to.not.throw();
    });

    it('does no throw when order_by contains multiple fields', () => {
        expect(() => {
            read.validateOrderBy(TestModel, testMeta, ['name', 'age']);
        }).to.not.throw();
    });

    it('does no throw when order_by specifies asc', () => {
        expect(() => {
            read.validateOrderBy(TestModel, testMeta, ['name asc', 'age']);
        }).to.not.throw();
    });

    it('does no throw when order_by specifies desc', () => {
        expect(() => {
            read.validateOrderBy(TestModel, testMeta, ['name', 'age desc']);
        }).to.not.throw();
    });

    it('throws when order_by is not an array', () => {
        expect(() => {
            read.validateOrderBy(TestModel, testMeta, { name: -1 });
        }).to.throw('must be an array');
    });

    it('throws when order_by has no items', () => {
        expect(() => {
            read.validateOrderBy(TestModel, testMeta, []);
        }).to.throw('must be an array');
    });

    it('throws when order_by contains a non-string', () => {
        expect(() => {
            read.validateOrderBy(TestModel, testMeta, ['name', 27]);
        }).to.throw('array contains a non-string value');
    });

    it('throws when order_by entry has too many tokens', () => {
        expect(() => {
            read.validateOrderBy(TestModel, testMeta, ['name asc desc', 'age']);
        }).to.throw('invalid entry');
    });

    it('throws when order_by entry has invalid tokens', () => {
        expect(() => {
            read.validateOrderBy(TestModel, testMeta, ['name dasc', 'age']);
        }).to.throw('invalid entry');
    });

    it('throws when order_by entry does not match a field name', () => {
        expect(() => {
            read.validateOrderBy(TestModel, testMeta, ['name', 'star_sign']);
        }).to.throw(`field 'star_sign' does not exist in model`);
    });

});
