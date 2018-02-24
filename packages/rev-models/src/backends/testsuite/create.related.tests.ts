
import { expect } from 'chai';

import { ModelManager } from '../../models/manager';
import { IBackend } from '../backend';
import { ModelOperationResult } from '../../operations/operationresult';
import { Company, Developer } from './testdata.related';
import { DEFAULT_CREATE_OPTIONS } from '../../operations/create';
import { ICreateMeta } from '../../models/types';

export function createWithRelatedModelTests(backendName: string, backend: IBackend) {

    describe(`Standard backend.create() with related model data tests for ${backendName}`, () => {

        let manager: ModelManager;
        let companyCreateResult: ModelOperationResult<Company, ICreateMeta>;
        let developerCreateResult: ModelOperationResult<Developer, ICreateMeta>;

        beforeEach(async () => {
            manager = new ModelManager();
            manager.registerBackend('default', backend);
            manager.register(Company);
            manager.register(Developer);
            companyCreateResult = new ModelOperationResult<Company, ICreateMeta>({operationName: 'create'});
            developerCreateResult = new ModelOperationResult<Developer, ICreateMeta>({operationName: 'create'});
            await cleanup();
        });

        async function cleanup() {
            await manager.remove(Company, { where: {}});
            await manager.remove(Developer, { where: {}});
        }

        it('stores undefined related model field as undefined', async () => {
            let model = new Developer();
            model.id = 1;
            model.name = 'Test Developer';

            const res = await backend.create(manager, model, DEFAULT_CREATE_OPTIONS, developerCreateResult);
            expect(res.results).to.be.undefined;
            expect(res.result).to.be.instanceof(Developer);
            expect(res.result).to.not.equal(model);
            expect(res.result.name).to.equal(model.name);
            expect(res.result.company).to.be.undefined;

            const readRes = await manager.read(Developer, { where: { id: 1 }, related: ['company']});
            expect(readRes.results[0].company).to.be.null;
        });

        it('stores null related model value and does not return it', async () => {
            let model = new Developer();
            model.id = 1;
            model.name = 'Test Developer';
            model.company = null;

            const res = await backend.create(manager, model, DEFAULT_CREATE_OPTIONS, developerCreateResult);
            expect(res.results).to.be.undefined;
            expect(res.result).to.be.instanceof(Developer);
            expect(res.result).to.not.equal(model);
            expect(res.result.name).to.equal(model.name);
            expect(res.result.company).to.be.undefined;

            const readRes = await manager.read(Developer, { where: { id: 1 }, related: ['company']});
            expect(readRes.results[0].company).to.be.null;
        });

        it('stores related model field as its primary key value and does not return it', async () => {
            let company = new Company({
                id: 1,
                name: 'Bobs Builders Ltd'
            });
            let model = new Developer({
                id: 1,
                name: 'Test Developer',
                company: company
            });

            await manager.create(company);

            const res = await backend.create(manager, model, DEFAULT_CREATE_OPTIONS, developerCreateResult);
            expect(res.results).to.be.undefined;
            expect(res.result).to.be.instanceof(Developer);
            expect(res.result).to.not.equal(model);
            expect(res.result.name).to.equal(model.name);
            expect(res.result.company).to.be.undefined;

            const readRes = await manager.read(Developer, { where: { id: 1 }, related: ['company']});
            expect(readRes.results[0].company).to.be.instanceof(Company);
            expect(readRes.results[0].company.id).to.equal(company.id);
        });

        it('does not store value for RelatedModelList fields', async () => {
            let developer1 = new Developer({
                id: 1,
                name: 'Test Developer'
            });
            let developer2 = new Developer({
                id: 2,
                name: 'Another Developer'
            });
            let model = new Company({
                id: 1,
                name: 'Bobs Builders Ltd',
                developers: [developer1, developer2]
            });

            const res = await backend.create(manager, model, DEFAULT_CREATE_OPTIONS, companyCreateResult);
            expect(res.results).to.be.undefined;
            expect(res.result).to.be.instanceof(Company);
            expect(res.result).to.not.equal(model);
            expect(res.result.name).to.equal(model.name);
            expect(res.result.developers).to.be.undefined;

            const readResult = await manager.read(Company, { where: { id: 1 }, related: ['developers']});
            expect(readResult.results[0].developers).to.deep.equal([]);
        });

    });

}
