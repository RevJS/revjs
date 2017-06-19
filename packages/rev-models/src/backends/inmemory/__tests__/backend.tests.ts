
import { expect } from 'chai';

import { ModelRegistry } from '../../../registry/registry';
import { InMemoryBackend } from '../backend';
import { ModelOperationResult } from '../../../operations/operationresult';
import { TestModel, testData } from './testdata';
import { DEFAULT_READ_OPTIONS, IReadMeta } from '../../../operations/read';

function getReadOpts(options?: object) {
    return Object.assign({}, DEFAULT_READ_OPTIONS, options);
}

describe('rev.backends.inmemory', () => {

    let registry: ModelRegistry;
    let backend: InMemoryBackend;
    let loadResult: ModelOperationResult<TestModel, null>;
    let readResult: ModelOperationResult<TestModel, IReadMeta>;

    beforeEach(() => {
        registry = new ModelRegistry();
        backend = new InMemoryBackend();
        registry.registerBackend('default', backend);
        registry.register(TestModel);
        loadResult = new ModelOperationResult<TestModel, null>({operation: 'load'});
        readResult = new ModelOperationResult<TestModel, IReadMeta>({operation: 'read'});
    });

    describe('initial state', () => {

        it('read() returns an empty list', () => {
            return backend.read(registry, TestModel, {}, readResult, getReadOpts())
                .then(() => {
                    expect(readResult.result).to.be.undefined;
                    expect(readResult.results).to.be.instanceOf(Array);
                    expect(readResult.results.length).to.equal(0);
                });
        });

    });

    describe('load()', () => {

        it('populates InMemoryBackend._storage with a copy of passed data', () => {
            return backend.load(registry, TestModel, testData, loadResult)
                .then(() => {
                    expect(backend._storage['TestModel']).to.deep.equal(testData);
                    expect(backend._storage['TestModel']).not.to.equal(testData);
                });
        });

        it('rejects if passed data is not an array of objects', () => {
            let badData = ['a', 'b', 'b', 1, 2, 3];
            return backend.load(registry, TestModel, badData as any, loadResult)
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('data must be an array of objects');
                });
        });

    });

});
