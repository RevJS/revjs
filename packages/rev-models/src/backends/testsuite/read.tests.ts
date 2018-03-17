
import { expect } from 'chai';

import { ModelManager } from '../../models/manager';
import { ModelOperationResult } from '../../operations/operationresult';
import { TestModel, TestModelNoPK } from './models';
import { createTestData, removeTestData, testDataNoPK } from './modeldata';
import { DEFAULT_READ_OPTIONS } from '../../operations/read';
import { IReadMeta } from '../../models/types';
import { IBackend } from '../backend';
import { IBackendTestConfig } from '.';

export function readTests(backendName: string, config: IBackendTestConfig) {

    function getReadOpts(options?: object) {
        return Object.assign({}, DEFAULT_READ_OPTIONS, options);
    }

    describe(`Standard backend.read() tests for ${backendName}`, () => {

        let backend: IBackend;
        let manager: ModelManager;
        let readResult: ModelOperationResult<TestModel, IReadMeta>;
        let readResult2: ModelOperationResult<TestModel, IReadMeta>;
        let readResultNoPk: ModelOperationResult<TestModelNoPK, IReadMeta>;

        before(() => {
            backend = config.backend;
            manager = new ModelManager();
            manager.registerBackend('default', backend);
            manager.register(TestModel);
            manager.register(TestModelNoPK);
            readResult = new ModelOperationResult<TestModel, IReadMeta>({operationName: 'read'});
            readResult2 = new ModelOperationResult<TestModel, IReadMeta>({operationName: 'read'});
            readResultNoPk = new ModelOperationResult<TestModelNoPK, IReadMeta>({operationName: 'read'});
        });

        describe('read() - with no data', () => {

            before(async () => {
                await manager.remove(TestModel, { where: {}});
            });

            it('returns a successful, empty result when where clause = {}', () => {
                return backend.read(manager, TestModel, getReadOpts(), readResult)
                    .then((res) => {
                        expect(res.success).to.be.true;
                        expect(res.result).to.be.undefined;
                        expect(res.results).to.deep.equal([]);
                    });
            });

            it('returns a successful, empty result when where clause sets a filter', () => {
                return backend.read(manager, TestModel, getReadOpts({
                    where: { name: { _like: '% Doe' } }
                }), readResult)
                    .then((res) => {
                        expect(res.success).to.be.true;
                        expect(res.result).to.be.undefined;
                        expect(res.results).to.deep.equal([]);
                    });
            });

        });

        describe('read() - with data', () => {

            before(async () => {
                await removeTestData(manager);
                await createTestData(manager);
            });

            it('returns all records when where clause = {}', () => {
                return backend.read(manager, TestModel, getReadOpts({ where: {} }), readResult)
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
                return backend.read(manager, TestModel, getReadOpts({ where: {} }), readResult)
                    .then((res) => {
                        expect(res.success).to.be.true;
                        expect(res.result).to.be.undefined;
                        expect(res.results).to.have.length(5);
                        expect(res.meta).to.deep.equal({
                            limit: DEFAULT_READ_OPTIONS.limit,
                            offset: DEFAULT_READ_OPTIONS.offset,
                            totalCount: 5
                        });
                    });
            });

            it('returns filtered records when where clause is set', () => {
                return backend.read(manager, TestModel, getReadOpts({
                    where: { name: { _like: '% Doe' }}
                }), readResult)
                    .then((res) => {
                        expect(res.success).to.be.true;
                        expect(res.result).to.be.undefined;
                        expect(res.results).to.have.length(2);
                        expect(res.results[0].name).to.equal('John Doe');
                        expect(res.results[1].name).to.equal('Jane Doe');
                    });
            });

            it('returns limited number of records when limit is set', () => {
                return backend.read(manager, TestModel, getReadOpts({
                    limit: 3
                }), readResult)
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
                return backend.read(manager, TestModel, getReadOpts({
                    offset: 2
                }), readResult)
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
                return backend.read(manager, TestModel, getReadOpts({
                    offset: 3,
                    limit: 1
                }), readResult)
                    .then((res) => {
                        expect(res.success).to.be.true;
                        expect(res.result).to.be.undefined;
                        expect(res.results).to.have.length(1);
                        expect(res.results[0].id).to.equal(3);
                    });
            });

            it('out of range limit and offset do not cause errors', () => {
                return Promise.all([
                    backend.read(manager, TestModel, getReadOpts({
                        offset: 100,
                        limit: 5
                    }), readResult),
                    backend.read(manager, TestModel, getReadOpts({
                        offset: 0,
                        limit: 40
                    }), readResult2),
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

            it('sorts results by a single orderBy field', () => {
                return backend.read(manager, TestModel, getReadOpts({
                    orderBy: ['name']
                }), readResult)
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

            it('sorts results by two orderBy fields', () => {
                return backend.read(manager, TestModel, getReadOpts({
                    orderBy: ['gender desc', 'name']
                }), readResult)
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

            if (!config.disableRawValues) {
                it('returns raw values when options.rawValues is set', () => {
                    return backend.read(manager, TestModel, getReadOpts({
                        rawValues: ['id']
                    }), readResult)
                        .then((res) => {
                            expect(res.success).to.be.true;
                            expect(res.result).to.be.undefined;
                            expect(res.results).to.have.length(5);
                            expect(res.results[0]).to.be.instanceof(TestModel);
                            expect(res.results[1]).to.be.instanceof(TestModel);
                            expect(res.results[2]).to.be.instanceof(TestModel);
                            expect(res.meta.rawValues).to.exist;
                            expect(res.meta.rawValues).to.have.length(5);
                            expect(res.meta.rawValues[1].id).to.equal(1);
                            expect(res.meta.rawValues[2].id).to.equal(2);
                        });
                });
            }

            it('throws when an invalid query is specified', () => {
                return backend.read(manager, TestModel, getReadOpts({
                    where: { non_existent_field: 42 }
                }), readResult)
                    .then(() => { throw new Error('expected to reject'); })
                    .catch((err) => {
                        expect(err.message).to.contain('not a recognised field');
                    });
            });

        });

        describe('read() - model with no primary key', () => {

            before(async () => {
                await removeTestData(manager);
                await createTestData(manager);
            });

            it('returns all records when where clause = {}', () => {
                return backend.read(manager, TestModelNoPK, getReadOpts({ where: {}, orderBy: ['name'] }), readResultNoPk)
                    .then((res) => {
                        expect(res.success).to.be.true;
                        expect(res.result).to.be.undefined;
                        expect(res.results).to.have.length(3);
                        expect(res.results[0]).to.be.instanceof(TestModelNoPK);
                        expect(res.results[1]).to.be.instanceof(TestModelNoPK);
                        expect(res.results[2]).to.be.instanceof(TestModelNoPK);
                        expect(res.results[0].name).to.equal(testDataNoPK[0].name);
                        expect(res.results[1].name).to.equal(testDataNoPK[1].name);
                        expect(res.results[2].name).to.equal(testDataNoPK[2].name);
                    });
            });

            it('returns filtered records when where clause is set', () => {
                return backend.read(manager, TestModelNoPK, getReadOpts({
                    where: { name: 'record2' }
                }), readResultNoPk)
                    .then((res) => {
                        expect(res.success).to.be.true;
                        expect(res.result).to.be.undefined;
                        expect(res.results).to.have.length(1);
                        expect(res.results[0].name).to.equal('record2');
                        expect(res.results[0].description).to.equal('This is the second record');
                    });
            });

        });

    });

}