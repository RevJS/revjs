
import { expect } from 'chai';

import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../backend';
import { ModelOperationResult } from '../../../operations/operationresult';
import { TestModel, testData } from './testdata';
import { DEFAULT_READ_OPTIONS } from '../../../operations/read';
import { IReadMeta } from '../../../models/types';

function getReadOpts(options?: object) {
    return Object.assign({}, DEFAULT_READ_OPTIONS, options);
}

describe('rev.backends.inmemory', () => {

    let manager: ModelManager;
    let backend: InMemoryBackend;
    let readResult: ModelOperationResult<TestModel, IReadMeta>;
    let readResult2: ModelOperationResult<TestModel, IReadMeta>;

    beforeEach(() => {
        manager = new ModelManager();
        backend = new InMemoryBackend();
        manager.registerBackend('default', backend);
        manager.register(TestModel);
        readResult = new ModelOperationResult<TestModel, IReadMeta>({operation: 'read'});
        readResult2 = new ModelOperationResult<TestModel, IReadMeta>({operation: 'read'});
    });

    describe('read() - with no data', () => {

        it('returns a successful, empty result when where clause = {}', () => {
            return backend.read(manager, TestModel, {}, readResult, getReadOpts())
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.deep.equal([]);
                });
        });

        it('returns a successful, empty result when where clause sets a filter', () => {
            return backend.read(manager, TestModel, { name: { _like: '% Doe' } }, readResult, getReadOpts())
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.deep.equal([]);
                });
        });

    });

    describe('read() - with data', () => {

        beforeEach(() => {
            return backend.load(manager, TestModel, testData);
        });

        it('returns all records when where clause = {}', () => {
            return backend.read(manager, TestModel, {}, readResult, getReadOpts())
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.have.length(5);
                    expect(res.results[0]).to.be.instanceof(TestModel);
                    expect(res.results[1]).to.be.instanceof(TestModel);
                    expect(res.results[2]).to.be.instanceof(TestModel);
                    expect(res.results[0].id).to.equal(0);
                    expect(res.results[1].id).to.equal(1);
                    expect(res.results[2].id).to.equal(2);
                });
        });

        it('returns IReadMeta matching DEFAULT_READ_OPTIONS', () => {
            return backend.read(manager, TestModel, {}, readResult, getReadOpts())
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.have.length(5);
                    expect(res.meta).to.deep.equal({
                        limit: DEFAULT_READ_OPTIONS.limit,
                        offset: DEFAULT_READ_OPTIONS.offset,
                        total_count: 5
                    });
                });
        });

        it('returns filtered records when where clause is set', () => {
            return backend.read(manager, TestModel, {
                name: { _like: '% Doe' }
            }, readResult, getReadOpts())
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.have.length(2);
                    expect(res.results[0].name).to.equal('John Doe');
                    expect(res.results[1].name).to.equal('Jane Doe');
                });
        });

        it('returns limited number of records when limit is set', () => {
            return backend.read(manager, TestModel, {}, readResult, getReadOpts({
                limit: 3
            }))
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.have.length(3);
                    expect(res.results[0].id).to.equal(0);
                    expect(res.results[1].id).to.equal(1);
                    expect(res.results[2].id).to.equal(2);
                });
        });

        it('offset option works as expected', () => {
            return backend.read(manager, TestModel, {}, readResult, getReadOpts({
                offset: 2
            }))
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.have.length(3);
                    expect(res.results[0].id).to.equal(2);
                    expect(res.results[1].id).to.equal(3);
                    expect(res.results[2].id).to.equal(4);
                });
        });

        it('limit and offset work together', () => {
            return backend.read(manager, TestModel, {}, readResult, getReadOpts({
                offset: 3,
                limit: 1
            }))
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.have.length(1);
                    expect(res.results[0].id).to.equal(3);
                });
        });

        it('out of range limit and offset do not cause errors', () => {
            return Promise.all([
                backend.read(manager, TestModel, {}, readResult, getReadOpts({
                    offset: 100,
                    limit: 5
                })),
                backend.read(manager, TestModel, {}, readResult2, getReadOpts({
                    offset: 0,
                    limit: 40
                })),
            ]).then((res) => {
                expect(res[0].success).to.be.true;
                expect(res[0].results).to.deep.equal([]);
                expect(res[0].meta.offset).to.equal(100);
                expect(res[0].meta.limit).to.equal(5);
                expect(res[1].success).to.be.true;
                expect(res[1].results).to.have.length(5);
                expect(res[1].meta.offset).to.equal(0);
                expect(res[1].meta.limit).to.equal(40);
            });
        });

        it('sorts results by a single order_by field', () => {
            return backend.read(manager, TestModel, {}, readResult, getReadOpts({
                order_by: ['name']
            }))
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.results).to.have.length(5);
                    expect(res.results[0].name).to.equal('Felix The Cat');
                    expect(res.results[0].id).to.equal(2);
                    expect(res.results[1].name).to.equal('Frostella the Snowlady');
                    expect(res.results[1].id).to.equal(4);
                    expect(res.results[2].name).to.equal('Jane Doe');
                    expect(res.results[2].id).to.equal(1);
                });
        });

        it('sorts results by two order_by fields', () => {
            return backend.read(manager, TestModel, {}, readResult, getReadOpts({
                order_by: ['gender desc', 'name']
            }))
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.results).to.have.length(5);
                    expect(res.results[0].name).to.equal('Felix The Cat');
                    expect(res.results[0].id).to.equal(2);
                    expect(res.results[1].name).to.equal('John Doe');
                    expect(res.results[1].id).to.equal(0);
                    expect(res.results[2].name).to.equal('Rambo');
                    expect(res.results[2].id).to.equal(3);
                });
        });

        it('returns raw values when options.raw_values is set', () => {
            return backend.read(manager, TestModel, {}, readResult, getReadOpts({
                raw_values: ['id']
            }))
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.have.length(5);
                    expect(res.results[0]).to.be.instanceof(TestModel);
                    expect(res.results[1]).to.be.instanceof(TestModel);
                    expect(res.results[2]).to.be.instanceof(TestModel);
                    expect(res.meta.raw_values).to.exist;
                    expect(res.meta.raw_values).to.have.length(5);
                    expect(res.meta.raw_values[1].id).to.equal(1);
                    expect(res.meta.raw_values[2].id).to.equal(2);
                });
        });

        it('throws an error if where clause is not provided', () => {
            return backend.read(manager, TestModel, null, readResult, getReadOpts())
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('read() requires the \'where\' parameter');
                });
        });

        it('throws an error if options.limit == 0', () => {
            return backend.read(manager, TestModel, {}, readResult, getReadOpts({
                    offset: 2,
                    limit: 0
                }))
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('options.limit cannot be less than 1');
                });
        });

        it('throws an error if options.limit is negative', () => {
            return backend.read(manager, TestModel, {}, readResult, getReadOpts({
                    offset: 2,
                    limit: -12
                }))
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('options.limit cannot be less than 1');
                });
        });

        it('throws an error if options.offset is negative', () => {
            return backend.read(manager, TestModel, {}, readResult, getReadOpts({
                    offset: -10,
                    limit: 10
                }))
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('options.offset cannot be less than zero');
                });
        });

        it('throws when an invalid query is specified', () => {
            return backend.read(manager, TestModel, {
                    non_existent_field: 42
                }, readResult, getReadOpts())
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('not a recognised field');
                });
        });

    });

});
