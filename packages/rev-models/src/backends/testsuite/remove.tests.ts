
import { expect } from 'chai';

import { ModelManager } from '../../models/manager';
import { IBackend } from '../backend';
import { ModelOperationResult } from '../../operations/operationresult';
import { TestModel, TestModelNoPK } from './models';
import { testData, createTestData, removeTestData } from './modeldata';
import { IRemoveMeta } from '../../models/types';
import { IBackendTestConfig } from '.';

export function removeTests(backendName: string, config: IBackendTestConfig) {

    describe(`Standard backend.remove() tests for ${backendName}`, () => {

        let backend: IBackend;
        let manager: ModelManager;
        let removeResult: ModelOperationResult<TestModel, IRemoveMeta>;

        beforeEach(async () => {
            backend = config.backend;
            manager = new ModelManager();
            manager.registerBackend('default', backend);
            manager.register(TestModel);
            manager.register(TestModelNoPK);
            removeResult = new ModelOperationResult<TestModel, IRemoveMeta>({operationName: 'remove'});

            await removeTestData(manager);
        });

        describe('remove() - with no data', () => {

            it('returns with totalCount = 0 when there is no data and where clause = {}', () => {
                let model = new TestModel();
                return backend.remove(manager, model, { where: {}}, removeResult)
                    .then((res) => {
                        expect(res.success).to.be.true;
                        expect(res.result).to.be.undefined;
                        expect(res.results).to.be.undefined;
                        expect(res.meta.totalCount).to.equal(0);
                    });
            });

            it('returns with totalCount = 0 when there is no data and where clause sets a filter', () => {
                let model = new TestModel();
                model.id = 1;
                return backend.remove(manager, model, { where: { id: 1 } }, removeResult)
                    .then((res) => {
                        expect(res.success).to.be.true;
                        expect(res.result).to.be.undefined;
                        expect(res.results).to.be.undefined;
                        expect(res.meta.totalCount).to.equal(0);
                    });
            });

        });

        describe('remove() - with data', () => {

            beforeEach(async () => {
                await removeTestData(manager);
                await createTestData(manager);
            });

            it('removes all records when where clause = {}', async () => {
                let model = new TestModel();
                model.name = 'bob';

                const res = await backend.remove(manager, model, { where: {}}, removeResult);
                expect(res.success).to.be.true;
                expect(res.result).to.be.undefined;
                expect(res.results).to.be.undefined;
                expect(res.meta.totalCount).to.equal(testData.length);

                const readRes = await manager.read(TestModel);
                expect(readRes.meta.totalCount).to.equal(0);
            });

            it('removes filtered records when where clause is set', async () => {
                let model = new TestModel();

                const res = await backend.remove(manager, model, {
                    where: { id: { _in: [2, 3] } }
                }, removeResult);
                expect(res.success).to.be.true;
                expect(res.result).to.be.undefined;
                expect(res.results).to.be.undefined;
                expect(res.meta.totalCount).to.equal(2);  // total removed

                const readRes = await manager.read(TestModel, { orderBy: ['id'] });
                readRes.results = readRes.results!;
                expect(readRes.results[0].id).to.equal(testData[0].id);
                expect(readRes.results[1].id).to.equal(testData[1].id);
                expect(readRes.results[2].id).to.equal(testData[4].id);
            });

            it('throws an error if where clause is not provided', () => {
                let model = new TestModel();
                return backend.remove(manager, model, { where: undefined as any }, removeResult)
                    .then(() => { throw new Error('expected to reject'); })
                    .catch((err) => {
                        expect(err.message).to.contain('remove() requires the \'where\' option');
                    });
            });

            it('throws when an invalid query is specified', () => {
                let model = new TestModel();
                return backend.remove(manager, model, { where: {
                        non_existent_field: 42
                    }}, removeResult)
                    .then(() => { throw new Error('expected to reject'); })
                    .catch((err) => {
                        expect(err.message).to.contain('not a recognised field');
                    });
            });

        });

    });

}