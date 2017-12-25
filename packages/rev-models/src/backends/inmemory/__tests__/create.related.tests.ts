
import { expect } from 'chai';

import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../backend';
import { ModelOperationResult } from '../../../operations/operationresult';
import { Company, Developer } from './testdata.related';
import { DEFAULT_CREATE_OPTIONS } from '../../../operations/create';
import { ICreateMeta } from '../../../models/types';

describe('rev.backends.inmemory - create() related field tests', () => {

    let manager: ModelManager;
    let backend: InMemoryBackend;
    let companyCreateResult: ModelOperationResult<Company, ICreateMeta>;
    let developerCreateResult: ModelOperationResult<Developer, ICreateMeta>;

    beforeEach(() => {
        manager = new ModelManager();
        backend = new InMemoryBackend();
        manager.registerBackend('default', backend);
        manager.register(Company);
        manager.register(Developer);
        companyCreateResult = new ModelOperationResult<Company, ICreateMeta>({operation: 'create'});
        developerCreateResult = new ModelOperationResult<Developer, ICreateMeta>({operation: 'create'});
    });

    it('stores undefined related model field as undefined', () => {
        let model = new Developer();
        model.id = 1;
        model.name = 'Test Developer';
        return backend.create(manager, model, developerCreateResult, DEFAULT_CREATE_OPTIONS)
            .then((res) => {
                expect(backend._storage['Developer']).to.deep.equal([
                    {
                        id: 1,
                        name: 'Test Developer'
                    }
                ]);
                expect(res.results).to.be.undefined;
                expect(res.result).to.be.instanceof(Developer);
                expect(res.result).to.not.equal(model);
                expect(res.result.name).to.equal(model.name);
                expect(res.result.company).to.be.undefined;
            });
    });

    it('stores null related model field as null and does not return it', () => {
        let model = new Developer();
        model.id = 1;
        model.name = 'Test Developer';
        model.company = null;
        return backend.create(manager, model, developerCreateResult, DEFAULT_CREATE_OPTIONS)
            .then((res) => {
                expect(backend._storage['Developer']).to.deep.equal([
                    {
                        id: 1,
                        name: 'Test Developer',
                        company: null
                    }
                ]);
                expect(res.results).to.be.undefined;
                expect(res.result).to.be.instanceof(Developer);
                expect(res.result).to.not.equal(model);
                expect(res.result.name).to.equal(model.name);
                expect(res.result.company).to.be.undefined;
            });
    });

    it('stores related model field as its primary key value and does not return it', () => {
        let company = new Company();
        company.id = 1;
        company.name = 'Bobs Builders Ltd';
        let model = new Developer();
        model.id = 1;
        model.name = 'Test Developer';
        model.company = company;
        return backend.create(manager, model, developerCreateResult, DEFAULT_CREATE_OPTIONS)
            .then((res) => {
                expect(backend._storage['Developer']).to.deep.equal([
                    {
                        id: 1,
                        name: 'Test Developer',
                        company: company.id
                    }
                ]);
                expect(res.results).to.be.undefined;
                expect(res.result).to.be.instanceof(Developer);
                expect(res.result).to.not.equal(model);
                expect(res.result.name).to.equal(model.name);
                expect(res.result.company).to.be.undefined;
            });
    });

    it('does not store value for RelatedModelList fields', () => {
        let developer1 = new Developer();
        developer1.id = 1;
        developer1.name = 'Test Developer';
        let developer2 = new Developer();
        developer2.id = 2;
        developer2.name = 'Another Developer';
        let model = new Company();
        model.id = 1;
        model.name = 'Bobs Builders Ltd';
        model.developers = [developer1, developer2];
        return backend.create(manager, model, companyCreateResult, DEFAULT_CREATE_OPTIONS)
            .then((res) => {
                expect(backend._storage['Company']).to.deep.equal([
                    {
                        id: 1,
                        name: 'Bobs Builders Ltd'
                    }
                ]);
                expect(res.results).to.be.undefined;
                expect(res.result).to.be.instanceof(Company);
                expect(res.result).to.not.equal(model);
                expect(res.result.name).to.equal(model.name);
                expect(res.result.developers).to.be.undefined;
            });
    });

});
