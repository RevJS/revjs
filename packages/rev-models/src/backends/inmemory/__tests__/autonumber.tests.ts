
import { expect } from 'chai';

import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../backend';
import { ModelOperationResult } from '../../../operations/operationresult';
import { DEFAULT_CREATE_OPTIONS } from '../../../operations/create';
import * as d from '../../../decorators';
import { ICreateMeta, IUpdateMeta } from '../../../models/types';

export class TestModel {
    @d.AutoNumberField({ primaryKey: true })
        id: number;
    @d.TextField()
        name: string;
}
describe('rev.backends.inmemory', () => {

    let manager: ModelManager;
    let backend: InMemoryBackend;
    let createResult: ModelOperationResult<TestModel, ICreateMeta>;
    let createResult2: ModelOperationResult<TestModel, ICreateMeta>;
    let loadResult: ModelOperationResult<TestModel, null>;
    let updateResult: ModelOperationResult<TestModel, IUpdateMeta>;

    beforeEach(() => {
        manager = new ModelManager();
        backend = new InMemoryBackend();
        manager.registerBackend('default', backend);
        manager.register(TestModel);
        createResult = new ModelOperationResult<TestModel, ICreateMeta>({operation: 'create'});
        createResult2 = new ModelOperationResult<TestModel, ICreateMeta>({operation: 'create'});
        loadResult = new ModelOperationResult<TestModel, null>({operation: 'load'});
        updateResult = new ModelOperationResult<TestModel, IUpdateMeta>({operation: 'update'});
    });

    describe('AutoNumberField', () => {

        it('new records get sequential numbers starting from 1', () => {
            let model1 = new TestModel();
            model1.name = 'record 1';
            let model2 = new TestModel();
            model2.name = 'record 2';

            return Promise.all([
                backend.create(manager, model1, createResult, DEFAULT_CREATE_OPTIONS),
                backend.create(manager, model2, createResult2, DEFAULT_CREATE_OPTIONS)
            ])
                .then((res) => {
                    expect(res[0].result).to.be.instanceof(TestModel);
                    expect(res[0].result.id).to.equal(1);
                    expect(res[1].result).to.be.instanceof(TestModel);
                    expect(res[1].result.id).to.equal(2);
                });
        });

        it('create() - values provided for AutoNumberField are ignored', () => {
            let model1 = new TestModel();
            model1.id = 99;
            model1.name = 'record 1';
            let model2 = new TestModel();
            model2.id = 227;
            model2.name = 'record 2';

            return Promise.all([
                backend.create(manager, model1, createResult, DEFAULT_CREATE_OPTIONS),
                backend.create(manager, model2, createResult2, DEFAULT_CREATE_OPTIONS)
            ])
                .then((res) => {
                    expect(res[0].result).to.be.instanceof(TestModel);
                    expect(res[0].result.id).to.equal(1);
                    expect(res[1].result).to.be.instanceof(TestModel);
                    expect(res[1].result.id).to.equal(2);
                });
        });

        it('update() - values provided for AutoNumberField are ignored', () => {
            let testData = [
                {
                    name: 'record 1',
                },
                {
                    name: 'record 2',
                }
            ];

            return backend.load(manager, TestModel, testData)
                .then(() => {
                    expect(backend._storage['TestModel'])
                        .to.deep.equal([
                            {
                                id: 1,
                                name: 'record 1',
                            },
                            {
                                id: 2,
                                name: 'record 2',
                            }
                        ]);
                    let model = new TestModel();
                    model.id = -10;
                    model.name = 'Frank';
                    return backend.update(manager,
                        model,
                        {}, updateResult, {});
                })
                .then(() => {
                    expect(backend._storage['TestModel'])
                        .to.deep.equal([
                            {
                                id: 1,
                                name: 'Frank',
                            },
                            {
                                id: 2,
                                name: 'Frank',
                            }
                        ]);
                });
        });

    });

});
