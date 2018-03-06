
import { expect } from 'chai';

import { ModelManager } from '../../models/manager';
import { ModelOperationResult } from '../../operations/operationresult';
import { DEFAULT_CREATE_OPTIONS } from '../../operations/create';
import * as d from '../../decorators';
import { ICreateMeta, IUpdateMeta } from '../../models/types';
import { IBackendTestConfig } from '.';
import { IBackend } from '..';

export function autoNumberTests(backendName: string, config: IBackendTestConfig) {

    class TestModel {
        @d.AutoNumberField({ primaryKey: true })
            id: number;
        @d.TextField()
            name: string;
        constructor(data?: Partial<TestModel>) {
            Object.assign(this, data);
        }
    }

    describe(`Standard backend AutoNumber field tests for ${backendName}`, () => {

        let backend: IBackend;
        let manager: ModelManager;
        let createResult: ModelOperationResult<TestModel, ICreateMeta>;
        let createResult2: ModelOperationResult<TestModel, ICreateMeta>;
        let updateResult: ModelOperationResult<TestModel, IUpdateMeta>;

        beforeEach(async () => {
            backend = config.backend;
            manager = new ModelManager();
            manager.registerBackend('default', backend);
            manager.register(TestModel);
            createResult = new ModelOperationResult<TestModel, ICreateMeta>({operationName: 'create'});
            createResult2 = new ModelOperationResult<TestModel, ICreateMeta>({operationName: 'create'});
            updateResult = new ModelOperationResult<TestModel, IUpdateMeta>({operationName: 'update'});

            await cleanup();
        });

        async function cleanup() {
            return manager.remove(TestModel, { where: {}});
        }

        it('each new record gets a new sequential number', async () => {
            let model1 = new TestModel();
            model1.name = 'record 1';
            let model2 = new TestModel();
            model2.name = 'record 2';

            const res1 = await backend.create(manager, model1, DEFAULT_CREATE_OPTIONS, createResult);
            const res2 = await backend.create(manager, model2, DEFAULT_CREATE_OPTIONS, createResult2);

            expect(res1.result).to.be.instanceof(TestModel);
            expect(res1.result.id).to.be.a('number');
            expect(res2.result).to.be.instanceof(TestModel);
            expect(res2.result.id).to.be.a('number');
            expect(res2.result.id).to.equal(res1.result.id + 1);
        });

        it('create() - values provided for AutoNumberField are stored', async () => {
            let model1 = new TestModel({
                id: 99,
                name: 'record 1'
            });
            let model2 = new TestModel({
                id: 227,
                name: 'record 2'
            });
            const res = await Promise.all([
                backend.create(manager, model1, DEFAULT_CREATE_OPTIONS, createResult),
                backend.create(manager, model2, DEFAULT_CREATE_OPTIONS, createResult2)
            ]);
            expect(res[0].result).to.be.instanceof(TestModel);
            expect(res[0].result.id).to.equal(99);
            expect(res[1].result).to.be.instanceof(TestModel);
            expect(res[1].result.id).to.equal(227);
        });

        it('update() - values provided for AutoNumberField are stored', async () => {
            let model1 = new TestModel({
                id: 1,
                name: 'record 1'
            });
            let model2 = new TestModel({
                id: 2,
                name: 'record 2'
            });
            await Promise.all([
                backend.create(manager, model1, DEFAULT_CREATE_OPTIONS, createResult),
                backend.create(manager, model2, DEFAULT_CREATE_OPTIONS, createResult2)
            ]);

            let model2Update = new TestModel({
                id: 10,
                name: 'Frank'
            });
            const updateRes = await backend.update(manager,
                model2Update,
                { where: { id: 2 }, fields: ['id', 'name'] }, updateResult);
            expect(updateRes.meta.totalCount).to.equal(1);

            const updateReadRes = await manager.read(TestModel, { where: { id: 10 }});
            expect(updateReadRes.meta.totalCount).to.equal(1);
            expect(updateReadRes.results[0].name).to.equal('Frank');

        });

    });

}