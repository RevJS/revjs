
import { expect } from 'chai';

import { IBackend } from '../backend';
import { ModelManager } from '../../models/manager';
import { ModelOperationResult } from '../../operations/operationresult';
import { TestModel, TestModelNoPK } from './models';
import { testData, removeTestData, createTestData } from './modeldata';
import { IUpdateMeta } from '../../models/types';
import { IBackendTestConfig } from '.';

export function updateTests(backendName: string, config: IBackendTestConfig) {

    describe(`Standard backend.update() tests for ${backendName}`, () => {

        let backend: IBackend;
        let manager: ModelManager;
        let updateResult: ModelOperationResult<TestModel, IUpdateMeta>;

        beforeEach(async () => {
            backend = config.backend;
            manager = new ModelManager();
            manager.registerBackend('default', backend);
            manager.register(TestModel);
            manager.register(TestModelNoPK);
            updateResult = new ModelOperationResult<TestModel, IUpdateMeta>({operationName: 'update'});

            await removeTestData(manager);
        });

        describe('update() - with no data', () => {

            it('returns with totalCount = 0 when there is no data and where clause = {}', () => {
                let model = new TestModel();
                model.id = 1;
                model.name = 'bob';
                return backend.update(manager, model, { where: {}, fields: ['id', 'name'] }, updateResult)
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
                model.name = 'bob';
                return backend.update(manager, model, { where: { id: { _gte: 0 } }, fields: ['id', 'name']}, updateResult)
                    .then((res) => {
                        expect(res.success).to.be.true;
                        expect(res.result).to.be.undefined;
                        expect(res.results).to.be.undefined;
                        expect(res.meta.totalCount).to.equal(0);
                    });
            });

        });

        describe('update() - with data', () => {

            beforeEach(async () => {
                await removeTestData(manager);
                await createTestData(manager);
            });

            it('updates all records with non-undefined model fields when where clause = {}', async () => {
                let model = new TestModel();
                model.name = 'bob';

                const res = await backend.update(manager, model, { where: {}, fields: [ 'name'] }, updateResult);
                expect(res.success).to.be.true;
                expect(res.result).to.be.undefined;
                expect(res.results).to.be.undefined;
                expect(res.meta.totalCount).to.equal(testData.length);

                const readRes = await manager.read(TestModel);
                expect(readRes.results[0].name).to.equal(model.name);
                expect(readRes.results[1].name).to.equal(model.name);
                expect(readRes.results[2].name).to.equal(model.name);
                expect(readRes.results[0].age).to.equal(testData[0].age);
                expect(readRes.results[1].age).to.equal(testData[1].age);
                expect(readRes.results[2].age).to.equal(testData[2].age);
            });

            it('updates filtered records with non-undefined model fields when where clause is set', async () => {
                let model = new TestModel();
                model.name = 'gertrude';
                model.gender = 'female';

                const res = await backend.update(manager, model, {
                    where: {
                        id: { _gt: 0, _lt: 3 }
                    },
                    fields: ['name', 'gender']
                }, updateResult);
                expect(res.success).to.be.true;
                expect(res.result).to.be.undefined;
                expect(res.results).to.be.undefined;
                expect(res.meta.totalCount).to.equal(2);

                const readRes = await manager.read(TestModel, { orderBy: ['id'] });
                expect(readRes.results[0].name).to.equal(testData[0].name);
                expect(readRes.results[1].name).to.equal(model.name);
                expect(readRes.results[2].name).to.equal(model.name);
                expect(readRes.results[0].gender).to.equal(testData[0].gender);
                expect(readRes.results[1].gender).to.equal(model.gender);
                expect(readRes.results[2].gender).to.equal(model.gender);
                expect(readRes.results[0].age).to.equal(testData[0].age);
                expect(readRes.results[1].age).to.equal(testData[1].age);
                expect(readRes.results[2].age).to.equal(testData[2].age);
            });

            it('updates only specific fields when options.fields is set', async () => {
                let model = new TestModel({
                    id: 99,
                    name: 'gertrude',
                    gender: 'female',
                    age: 112,
                    newsletter: false
                });

                const res = await backend.update(manager, model, {
                    where: { id: 2 },
                    fields: ['age']
                }, updateResult);
                expect(res.success).to.be.true;
                expect(res.result).to.be.undefined;
                expect(res.results).to.be.undefined;
                expect(res.meta.totalCount).to.equal(1);

                const readRes = await manager.read(TestModel, { where: { id: 2 } });
                expect(readRes.results[0].id).to.equal(testData[2].id);
                expect(readRes.results[0].name).to.equal(testData[2].name);
                expect(readRes.results[0].gender).to.equal(testData[2].gender);
                expect(readRes.results[0].age).to.equal(model.age);
                expect(readRes.results[0].newsletter).to.equal(testData[2].newsletter);
            });

            it('throws an error if where clause is not provided', () => {
                let model = new TestModel();
                return backend.update(manager, model, {}, updateResult)
                    .then(() => { throw new Error('expected to reject'); })
                    .catch((err) => {
                        expect(err.message).to.contain(`update() requires the 'where' option to be set.`);
                    });
            });

            it('throws when an invalid query is specified', () => {
                let model = new TestModel();
                return backend.update(manager, model, { where: {
                        non_existent_field: 42
                    }}, updateResult)
                    .then(() => { throw new Error('expected to reject'); })
                    .catch((err) => {
                        expect(err.message).to.contain('not a recognised field');
                    });
            });

        });

    });

}