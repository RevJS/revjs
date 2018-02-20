
import { expect } from 'chai';
import { MongoDBBackend } from '../backend';
import { testConfig } from './testconfig';

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