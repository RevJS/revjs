
import { expect } from 'chai';
import { MongoDBBackend } from '../backend';
import { testConfig } from './testconfig';

import { createTests } from 'rev-models/lib/backends/testsuite/create.tests';
import { readTests } from 'rev-models/lib/backends/testsuite/read.tests';
import { updateTests } from 'rev-models/lib/backends/testsuite/update.tests';
import { removeTests } from 'rev-models/lib/backends/testsuite/remove.tests';
import { IBackendTestConfig } from '../../../rev-models/lib/backends/testsuite';

describe('MongoDBBackend', () => {
    let backend: MongoDBBackend;

    describe('Connecting to MongoDB', () => {

        afterEach(() => {
            backend.disconnect();
        });

        it('can connect to existing mongodb server', async () => {
            backend = new MongoDBBackend(testConfig);
            await backend.connect();
        });

        it('throws an error when connection fails', async () => {
            backend = new MongoDBBackend({
                url: 'mongodb://localhost:12345',
                dbName: 'RevJS'
            });
            await backend.connect()
                .then(() => {
                    throw new Error('expected to throw');
                })
                .catch((e) => {
                    expect(e.message).to.contain('failed to connect to server');
                });
        });

    });

});

describe('MongoDBBackend - RevJS Backend Tests', () => {
    const config: IBackendTestConfig = {} as any;
    let backend: MongoDBBackend;

    before(async () => {
        backend = new MongoDBBackend(testConfig);
        await backend.connect();
        config.backend = backend;
    });

    createTests('MongoDBBackend', config);
    readTests('MongoDBBackend', config);
    updateTests('MongoDBBackend', config);
    removeTests('MongoDBBackend', config);

    after(() => {
        backend.disconnect();
    });

});