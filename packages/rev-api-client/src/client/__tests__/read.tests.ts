
import { expect } from 'chai';

import { AxiosRequestConfig, AxiosPromise } from 'axios';
import { getMockApiHttpClient } from '../__test_utils__/mockapi';
import { ModelApiBackend } from '../client';
import { getModelManager, Comment } from '../__fixtures__/models';
import { ModelManager, ModelOperationResult } from 'rev-models';
import { IReadMeta, IReadOptions } from 'rev-models/lib/models/types';

describe('ModelApiBackend - read()', () => {

    let manager: ModelManager;
    let mockHttpClient: (config: AxiosRequestConfig) => AxiosPromise;
    let apiBackend: ModelApiBackend;
    let readOptions: IReadOptions;
    let readResult: ModelOperationResult<Comment, IReadMeta>;

    beforeEach(async () => {
        manager = getModelManager();
        mockHttpClient = await getMockApiHttpClient(manager);
        apiBackend = new ModelApiBackend('/api', mockHttpClient);
        readOptions = {};
        readResult = new ModelOperationResult<Comment, IReadMeta>({operation: 'read'});
    });

    it('can read scalar data from graphql api', async () => {
        const result = await apiBackend.read(
            manager, Comment, {}, readResult, readOptions
        );
        expect(result.success).to.be.true;
        expect(result.results).to.deep.equal([
            { id: 1, comment: 'I totally agree' },
            { id: 2, comment: 'Sweet!' }
        ]);
        expect(result.results[0]).to.be.instanceof(Comment);
        expect(result.results[1]).to.be.instanceof(Comment);
    });

});
