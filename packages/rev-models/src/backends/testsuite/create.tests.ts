import { IBackend } from '../backend';
import { expect } from 'chai';

import { ModelManager } from '../../models/manager';
import { ModelOperationResult } from '../../operations/operationresult';
import { TestModel } from './models';
import { DEFAULT_CREATE_OPTIONS } from '../../operations/create';
import { ICreateMeta } from '../../models/types';
import { IBackendTestConfig } from '.';

export function createTests(backendName: string, config: IBackendTestConfig) {

    describe(`Standard backend.create() tests for ${backendName}`, () => {

        let backend: IBackend;
        let manager: ModelManager;
        let createResult: ModelOperationResult<TestModel, ICreateMeta>;
        let createResult2: ModelOperationResult<TestModel, ICreateMeta>;

        beforeEach(async () => {
            backend = config.backend;
            manager = new ModelManager();
            manager.registerBackend('default', backend);
            manager.register(TestModel);
            createResult = new ModelOperationResult<TestModel, ICreateMeta>({operationName: 'create'});
            createResult2 = new ModelOperationResult<TestModel, ICreateMeta>({operationName: 'create'});
            await cleanup();
        });

        async function cleanup() {
            return manager.remove(TestModel, { where: {}});
        }

        it('stores model data and returns a new model instance', async () => {
            let model = new TestModel();
            model.id = 1;
            model.name = 'test model';
            model.age = 20;
            const res = await backend.create(manager, model, DEFAULT_CREATE_OPTIONS, createResult);
            expect(res.results).to.be.undefined;
            expect(res.result).to.be.instanceof(TestModel);
            expect(res.result).to.not.equal(model);
            expect(res.result!.name).to.equal(model.name);
            expect(res.result!.age).to.equal(model.age);
            expect(res.result!.gender).to.be.undefined;

            const readRes = await manager.read(TestModel, { where: { id: 1 }});
            expect(readRes.meta.totalCount).to.equal(1);
            expect(readRes.results![0]).to.include({
                id: 1,
                name: 'test model',
                age: 20
            });
            expect(readRes.results![0]).to.be.instanceof(TestModel);
        });

        it('stores multiple records', async () => {
            let model1 = new TestModel();
            model1.name = 'test model 1';
            model1.age = 21;
            let model2 = new TestModel();
            model2.name = 'test model 2';
            model2.age = 22;
            const res = await Promise.all([
                backend.create(manager, model1, DEFAULT_CREATE_OPTIONS, createResult),
                backend.create(manager, model2, DEFAULT_CREATE_OPTIONS, createResult2)
            ]);
            expect(res[0].result).to.be.instanceof(TestModel);
            expect(res[1].result).to.be.instanceof(TestModel);
            expect(res[0].result).to.not.equal(model1);
            expect(res[1].result).to.not.equal(model2);
            expect(res[0].result!.name).to.equal(model1.name);
            expect(res[1].result!.name).to.equal(model2.name);

            const readRes = await manager.read(TestModel);
            expect(readRes.meta.totalCount).to.equal(2);
        });

    });
}