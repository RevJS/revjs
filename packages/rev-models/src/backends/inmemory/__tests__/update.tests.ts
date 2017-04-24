
import { expect } from 'chai';

import { ModelRegistry } from '../../../registry/registry';
import { InMemoryBackend } from '../backend';
import { ModelOperationResult } from '../../../operations/operationresult';
import { TestModel, testData } from './testdata';
import { IUpdateOptions, IUpdateMeta } from '../../../operations/update';

describe('rev.backends.inmemory', () => {

    let registry: ModelRegistry;
    let options: IUpdateOptions;
    let backend: InMemoryBackend;
    let loadResult: ModelOperationResult<TestModel, null>;
    let updateResult: ModelOperationResult<TestModel, IUpdateMeta>;
    let updateResult2: ModelOperationResult<TestModel, IUpdateMeta>;

    beforeEach(() => {
        registry = new ModelRegistry();
        options = {};
        backend = new InMemoryBackend();
        registry.registerBackend('default', backend);
        registry.register(TestModel);
        loadResult = new ModelOperationResult<TestModel, null>({operation: 'load'});
        updateResult = new ModelOperationResult<TestModel, IUpdateMeta>({operation: 'update'});
        updateResult2 = new ModelOperationResult<TestModel, IUpdateMeta>({operation: 'update'});
    });

    describe('update() - with no data', () => {

        it('returns with total_count = 0 when there is no data and where clause = {}', () => {
            let model = new TestModel({ id: 1, name: 'bob' });
            return backend.update(registry, model, {}, updateResult, options)
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.be.undefined;
                    expect(res.meta.total_count).to.equal(0);
                });
        });

        it('returns with total_count = 0 when there is no data and where clause sets a filter', () => {
            let model = new TestModel({ id: 1, name: 'bob' });
            return backend.update(registry, model, { id: { $gte: 0 } }, updateResult, {})
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.be.undefined;
                    expect(res.meta.total_count).to.equal(0);
                });
        });

    });

    describe('update() - with data', () => {

        beforeEach(() => {
            return backend.load(registry, TestModel, testData, loadResult)
            .then(() => {
                // Assert that stored data matches testData
                for (let i = 0; i < testData.length; i++) {
                    expect(backend._storage['TestModel'][i])
                        .to.deep.equal(testData[i]);
                }
            });
        });

        it('updates all records with non-undefined model fields when where clause = {}', () => {
            let model = new TestModel({ name: 'bob' });
            return backend.update(registry, model, {}, updateResult, options)
                .then((res) => {
                    let storage = backend._storage['TestModel'];
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.be.undefined;
                    expect(res.meta.total_count).to.equal(testData.length);
                    expect(storage[0].name).to.equal(model.name);
                    expect(storage[1].name).to.equal(model.name);
                    expect(storage[2].name).to.equal(model.name);
                    expect(storage[0].age).to.equal(testData[0].age);
                    expect(storage[1].age).to.equal(testData[1].age);
                    expect(storage[2].age).to.equal(testData[2].age);
                });
        });

        it('updates filtered records with non-undefined model fields when where clause is set', () => {
            let model = new TestModel({ name: 'gertrude', gender: 'female' });
            return backend.update(registry, model, {
                id: { $gt: 0, $lt: 3 }
            }, updateResult, {})
                .then((res) => {
                    let storage = backend._storage['TestModel'];
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.be.undefined;
                    expect(res.meta.total_count).to.equal(2);
                    expect(storage[0].name).to.equal(testData[0].name);
                    expect(storage[1].name).to.equal(model.name);
                    expect(storage[2].name).to.equal(model.name);
                    expect(storage[0].gender).to.equal(testData[0].gender);
                    expect(storage[1].gender).to.equal(model.gender);
                    expect(storage[2].gender).to.equal(model.gender);
                    expect(storage[0].age).to.equal(testData[0].age);
                    expect(storage[1].age).to.equal(testData[1].age);
                    expect(storage[2].age).to.equal(testData[2].age);
                });
        });

        it('updates records with specific fields when options.fields is set', () => {
            let model = new TestModel({
                id: 99,
                name: 'gertrude',
                gender: 'female',
                age: 112,
                newsletter: false
            });
            return backend.update(registry, model, { id: 2 }, updateResult, {
                fields: ['age']
            })
                .then((res) => {
                    let storage = backend._storage['TestModel'];
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.be.undefined;
                    expect(res.meta.total_count).to.equal(1);
                    expect(storage[2].id).to.equal(testData[2].id);
                    expect(storage[2].name).to.equal(testData[2].name);
                    expect(storage[2].gender).to.equal(testData[2].gender);
                    expect(storage[2].age).to.equal(model.age);
                    expect(storage[2].newsletter).to.equal(testData[2].newsletter);
                });
        });

        it('throws an error if where clause is not provided', () => {
            let model = new TestModel();
            return expect(
                backend.update(registry, model, null, updateResult, {})
            ).to.be.rejectedWith('update() requires the \'where\' parameter');
        });

        it('throws when an invalid query is specified', () => {
            let model = new TestModel();
            return expect(
                backend.update(registry, model, {
                    non_existent_field: 42
                }, updateResult, {})
            ).to.be.rejectedWith('not a recognised field');
        });

    });

});
