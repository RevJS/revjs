
import { expect } from 'chai';

import { ModelRegistry } from '../../../registry/registry';
import { InMemoryBackend } from '../backend';
import { ModelOperationResult } from '../../../operations/operationresult';
import { TestModel, testData } from './testdata';
import { IRemoveOptions, IRemoveMeta } from '../../../operations/remove';

describe('rev.backends.inmemory', () => {

    let registry: ModelRegistry;
    let options: IRemoveOptions;
    let backend: InMemoryBackend;
    let loadResult: ModelOperationResult<TestModel, null>;
    let removeResult: ModelOperationResult<TestModel, IRemoveMeta>;
    let removeResult2: ModelOperationResult<TestModel, IRemoveMeta>;

    beforeEach(() => {
        registry = new ModelRegistry();
        options = {};
        backend = new InMemoryBackend();
        registry.registerBackend('default', backend);
        registry.register(TestModel);
        loadResult = new ModelOperationResult<TestModel, null>({operation: 'load'});
        removeResult = new ModelOperationResult<TestModel, IRemoveMeta>({operation: 'remove'});
        removeResult2 = new ModelOperationResult<TestModel, IRemoveMeta>({operation: 'remove'});
    });

    describe('remove() - with no data', () => {

        it('returns with total_count = 0 when there is no data and where clause = {}', () => {
            let model = new TestModel();
            return backend.remove(registry, model, {}, removeResult, options)
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.be.undefined;
                    expect(res.meta.total_count).to.equal(0);
                });
        });

        it('returns with total_count = 0 when there is no data and where clause sets a filter', () => {
            let model = new TestModel({ id: 1 });
            return backend.remove(registry, model, { id: 1 }, removeResult, {})
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.be.undefined;
                    expect(res.meta.total_count).to.equal(0);
                });
        });

    });

    describe('remove() - with data', () => {

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

        it('removes all records when where clause = {}', () => {
            let model = new TestModel({ name: 'bob' });
            expect(backend._storage['TestModel']).to.have.length(5);
            return backend.remove(registry, model, {}, removeResult, options)
                .then((res) => {
                    let storage = backend._storage['TestModel'];
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.be.undefined;
                    expect(res.meta.total_count).to.equal(testData.length);
                    expect(storage).to.have.length(0);
                });
        });

        it('removes filtered records when where clause is set', () => {
            let model = new TestModel();
            return backend.remove(registry, model, {
                id: { $in: [2, 3] }
            }, removeResult, {})
                .then((res) => {
                    let storage = backend._storage['TestModel'];
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.be.undefined;
                    expect(res.meta.total_count).to.equal(2);  // total removed
                    expect(storage[0].id).to.equal(testData[0].id);
                    expect(storage[1].id).to.equal(testData[1].id);
                    expect(storage[2].id).to.equal(testData[4].id);
                });
        });

        it('throws an error if where clause is not provided', () => {
            let model = new TestModel();
            return backend.remove(registry, model, null, removeResult, {})
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('remove() requires the \'where\' parameter');
                });
        });

        it('throws when an invalid query is specified', () => {
            let model = new TestModel();
            return backend.remove(registry, model, {
                    non_existent_field: 42
                }, removeResult, {})
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('not a recognised field');
                });
        });

    });

});
