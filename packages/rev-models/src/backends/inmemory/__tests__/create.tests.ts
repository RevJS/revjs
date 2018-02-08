
import { expect } from 'chai';

import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../backend';
import { ModelOperationResult } from '../../../operations/operationresult';
import { TestModel } from './testdata';
import { DEFAULT_CREATE_OPTIONS } from '../../../operations/create';
import { ICreateMeta } from '../../../models/types';

describe('rev.backends.inmemory', () => {

    let manager: ModelManager;
    let backend: InMemoryBackend;
    let createResult: ModelOperationResult<TestModel, ICreateMeta>;
    let createResult2: ModelOperationResult<TestModel, ICreateMeta>;

    beforeEach(() => {
        manager = new ModelManager();
        backend = new InMemoryBackend();
        manager.registerBackend('default', backend);
        manager.register(TestModel);
        createResult = new ModelOperationResult<TestModel, ICreateMeta>({operation: 'create'});
        createResult2 = new ModelOperationResult<TestModel, ICreateMeta>({operation: 'create'});
    });

    describe('create()', () => {

        it('stores model data as a plain object and returns a new model instance', () => {
            let model = new TestModel();
            model.name = 'test model';
            model.age = 20;
            return backend.create(manager, model, DEFAULT_CREATE_OPTIONS, createResult)
                .then((res) => {
                    expect(backend._storage['TestModel']).to.deep.equal([
                        {
                            name: 'test model',
                            age: 20
                        }
                    ]);
                    expect(res.results).to.be.undefined;
                    expect(res.result).to.be.instanceof(TestModel);
                    expect(res.result).to.not.equal(model);
                    expect(res.result.name).to.equal(model.name);
                    expect(res.result.age).to.equal(model.age);
                    expect(res.result.gender).to.be.undefined;
                });
        });

        it('stores multiple records', () => {
            let model1 = new TestModel();
            model1.name = 'test model 1';
            model1.age = 21;
            let model2 = new TestModel();
            model2.name = 'test model 2';
            model2.age = 22;
            return Promise.all([
                backend.create(manager, model1, DEFAULT_CREATE_OPTIONS, createResult),
                backend.create(manager, model2, DEFAULT_CREATE_OPTIONS, createResult2)
            ])
                .then((res) => {
                    expect(backend._storage['TestModel']).to.deep.equal([
                        {
                            name: 'test model 1',
                            age: 21
                        },
                        {
                            name: 'test model 2',
                            age: 22
                        }
                    ]);
                    expect(res[0].result).to.be.instanceof(TestModel);
                    expect(res[1].result).to.be.instanceof(TestModel);
                    expect(res[0].result).to.not.equal(model1);
                    expect(res[1].result).to.not.equal(model2);
                    expect(res[0].result.name).to.equal(model1.name);
                    expect(res[1].result.name).to.equal(model2.name);
                });
        });

    });

});
