
import { expect } from 'chai';

import { ModelManager } from '../../models/manager';
import { ModelOperationResult } from '../../operations/operationresult';
import { TestModel, TestModelNoPK } from './models';
import { createTestData, removeTestData } from './modeldata';
import { DEFAULT_READ_OPTIONS } from '../../operations/read';
import { IReadMeta } from '../../models/types';
import { IBackend, IReadParams } from '../backend';
import { IBackendTestConfig } from '.';
import { IObject } from '../../utils/types';

export function queryTests(backendName: string, config: IBackendTestConfig) {

    function getReadOpts(options?: IObject) {
        return Object.assign({}, DEFAULT_READ_OPTIONS, options) as IReadParams;
    }

    describe(`Standard RevJS Query tests for ${backendName}`, () => {

        let backend: IBackend;
        let manager: ModelManager;
        let readResult: ModelOperationResult<TestModel, IReadMeta>;

        before(async () => {
            backend = config.backend;
            manager = new ModelManager();
            manager.registerBackend('default', backend);
            manager.register(TestModel);
            manager.register(TestModelNoPK);
            readResult = new ModelOperationResult<TestModel, IReadMeta>({operationName: 'read'});
            await removeTestData(manager);
            await createTestData(manager);
        });

        describe('MultiSelectField query tests', () => {

            it('_eq searches the selected options for a match', () => {
                return backend.read(manager, TestModel, getReadOpts({
                    where: { hobbies: 'music' }
                }), readResult)
                    .then((res) => {
                        expect(res.success).to.be.true;
                        expect(res.result).to.be.undefined;
                        expect(res.results).to.have.length(2);
                        expect(res.results![0].name).to.equal('John Doe');
                        expect(res.results![1].name).to.equal('Jane Doe');
                    });
            });

        });

    });

}