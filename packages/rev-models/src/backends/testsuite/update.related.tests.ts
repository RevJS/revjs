
import { expect } from 'chai';

import { ModelManager } from '../../models/manager';
import { IBackend } from '../backend';
import { ModelOperationResult } from '../../operations/operationresult';
import { Company, Developer, removeRelatedTestData, createRelatedTestData, testCompanyData, City, Department, testCityData, testDeveloperData } from './testdata.related';
import { IUpdateMeta } from '../../models/types';
import { IBackendTestConfig } from '.';

export function updateWithRelatedModelTests(backendName: string, config: IBackendTestConfig) {

    describe(`Standard backend.update() with related model data tests for ${backendName}`, () => {

        let backend: IBackend;
        let manager: ModelManager;
        let companyUpdateResult: ModelOperationResult<Company, IUpdateMeta>;
        let developerUpdateResult: ModelOperationResult<Developer, IUpdateMeta>;

        beforeEach(async () => {
            backend = config.backend;
            manager = new ModelManager();
            manager.registerBackend('default', backend);
            manager.register(Company);
            manager.register(Developer);
            manager.register(City);
            manager.register(Department);
            companyUpdateResult = new ModelOperationResult<Company, IUpdateMeta>({operationName: 'create'});
            developerUpdateResult = new ModelOperationResult<Developer, IUpdateMeta>({operationName: 'create'});

            await removeRelatedTestData(manager);
            await createRelatedTestData(manager);
        });

        it('undefined related model field values do not remove existing values', async () => {
            let model = new Developer();
            model.id = 1;
            model.name = 'Updated Name';

            const res = await backend.update(manager, model, { where: { id: 1 }}, developerUpdateResult);
            expect(res.results).to.be.undefined;
            expect(res.result).to.be.undefined;
            expect(res.meta.totalCount).to.equal(1);

            const readRes = await manager.read(Developer, { where: { id: 1 }, related: ['company']});
            expect(readRes.results[0].name).to.equal('Updated Name');
            expect(readRes.results[0].company).to.deep.equal(testCompanyData[0]);
        });

        it('setting related model field to null removes the relation', async () => {
            let model = new Developer();
            model.id = 1;
            model.company = null;

            const res = await backend.update(manager, model, { where: { id: 1 }}, developerUpdateResult);
            expect(res.results).to.be.undefined;
            expect(res.result).to.be.undefined;
            expect(res.meta.totalCount).to.equal(1);

            const readRes = await manager.read(Developer, { where: { id: 1 }, related: ['company']});
            expect(readRes.results[0].company).to.be.null;
        });

        it('stores related model reference', async () => {
            let model = new Developer({
                id: 2,
                city: testCityData[1]
            });

            const res = await backend.update(manager, model, { where: { id: 2 }}, developerUpdateResult);
            expect(res.results).to.be.undefined;
            expect(res.result).to.be.undefined;
            expect(res.meta.totalCount).to.equal(1);

            const readRes = await manager.read(Developer, { where: { id: 2 }, related: ['city']});
            expect(readRes.results[0].city).to.be.instanceof(City);
            expect(readRes.results[0].city.id).to.equal(testCityData[1].id);
        });

        it('does not store value for RelatedModelList fields', async () => {
            let model = new Company({
                id: 3,
                developers: [testDeveloperData[0], testDeveloperData[1]]
            });

            const res = await backend.update(manager, model, { where: { id: 3 }}, companyUpdateResult);
            expect(res.results).to.be.undefined;
            expect(res.result).to.be.undefined;
            expect(res.meta.totalCount).to.equal(1);

            const readResult = await manager.read(Company, { where: { id: 3 }, related: ['developers']});
            expect(readResult.results[0].developers).to.deep.equal([]);
        });

    });

}
