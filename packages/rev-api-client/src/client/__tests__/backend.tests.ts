
import { expect } from 'chai';
import { ModelApiBackend } from '../backend';
import { ModelManager, InMemoryBackend } from 'rev-models';
import { standardBackendTests, IBackendTestConfig } from 'rev-models/lib/backends/testsuite';
import { registerModels } from 'rev-models/lib/backends/testsuite/models';
import { getMockApiHttpClient } from '../__test_utils__/mockHttpClient';

describe('ModelApiBackend', () => {

    it('can be constructed with an apiUrl', () => {
        expect(() => {
            new ModelApiBackend('/api');
        }).not.to.throw();
    });

    it('throws if apiUrl is not provided', () => {
        expect(() => {
            new (ModelApiBackend as any)();
        }).to.throw('You must provide an apiUrl');
    });

});

describe('ModelApiBackend - RevJS Backend Tests', () => {
    const config: IBackendTestConfig = {} as any;
    let backend: ModelApiBackend;

    before(async () => {
        // Create an in-memory model manager for API data
        const apiModelManager = new ModelManager();
        apiModelManager.registerBackend('default', new InMemoryBackend());
        registerModels(apiModelManager);

        // Create a mock Axios client for querying the API
        const mockHttpClient = getMockApiHttpClient(apiModelManager);

        // Create the backend ready for testing
        backend = new ModelApiBackend('/api', mockHttpClient);
        config.backend = backend;

    });

    // Configure capabilities
    config.skipRawValueTests = true;
    config.skipRelatedModelListStoreTest = true;

    standardBackendTests('ModelApiBackend', config);

});