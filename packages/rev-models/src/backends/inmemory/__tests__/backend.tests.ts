
import { expect } from 'chai';

import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../backend';
import { ModelOperationResult } from '../../../operations/operationresult';
import { TestModel, testData } from './testdata';
import { DEFAULT_READ_OPTIONS } from '../../../operations/read';
import { IReadMeta } from '../../../models/types';
import { standardBackendTests } from '../../testsuite';

function getReadOpts(options?: object) {
    return Object.assign({}, DEFAULT_READ_OPTIONS, options);
}

describe('rev.backends.inmemory', () => {

    let manager: ModelManager;
    let backend: InMemoryBackend;
    let readResult: ModelOperationResult<TestModel, IReadMeta>;

    beforeEach(() => {
        manager = new ModelManager();
        backend = new InMemoryBackend();
        manager.registerBackend('default', backend);
        manager.register(TestModel);
        readResult = new ModelOperationResult<TestModel, IReadMeta>({operationName: 'read'});
    });

    describe('initial state', () => {

        it('read() returns an empty list', () => {
            return backend.read(manager, TestModel, getReadOpts(), readResult)
                .then(() => {
                    expect(readResult.result).to.be.undefined;
                    expect(readResult.results).to.be.instanceOf(Array);
                    expect(readResult.results.length).to.equal(0);
                });
        });

    });

    describe('load()', () => {

        it('populates InMemoryBackend._storage with a copy of passed data', async () => {
            await backend.load(manager, TestModel, testData);
            const res = await backend.read(manager, TestModel, getReadOpts(), readResult);
            expect(res.results).to.have.length(testData.length);
            expect(res.results[0].id).to.deep.equal(testData[0].id);
            expect(res.results[4].id).to.deep.equal(testData[4].id);
        });

        it('rejects if passed data is not an array of objects', () => {
            let badData = ['a', 'b', 'b', 1, 2, 3];
            return backend.load(manager, TestModel, badData as any)
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('data must be an array of objects');
                });
        });

    });

});

const inMemoryBackend = new InMemoryBackend();
standardBackendTests('InMemoryBackend', { backend: inMemoryBackend });
