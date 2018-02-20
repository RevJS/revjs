
import { expect } from 'chai';
import { MongoDBBackend, IMongoDBBackendConfig } from '../backend';

describe('MongoDBBackend', () => {
    let backend: MongoDBBackend;
    const config: IMongoDBBackendConfig = {
        url: 'mongodb://localhost:27017',
        dbName: 'RevJS'
    };

    describe('Connecting to MongoDB', () => {

        afterEach(() => {
            backend.disconnect();
        });

        it('can connect to existing mongodb server', async () => {
            backend = new MongoDBBackend(config);
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