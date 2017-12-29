
import { expect } from 'chai';

import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../backend';
import { ModelOperationResult } from '../../../operations/operationresult';
import { Company, Developer, testCompanyData, testDeveloperData } from './testdata.related';
import { IUpdateOptions, IUpdateMeta } from '../../../models/types';

describe('rev.backends.inmemory - update() related field tests', () => {

    let manager: ModelManager;
    let options: IUpdateOptions;
    let backend: InMemoryBackend;
    let companyUpdateResult: ModelOperationResult<Company, IUpdateMeta>;
    let developerUpdateResult: ModelOperationResult<Developer, IUpdateMeta>;

    beforeEach(() => {
        manager = new ModelManager();
        options = {};
        backend = new InMemoryBackend();
        manager.registerBackend('default', backend);
        manager.register(Company);
        manager.register(Developer);
        companyUpdateResult = new ModelOperationResult<Company, IUpdateMeta>({operation: 'update'});
        developerUpdateResult = new ModelOperationResult<Developer, IUpdateMeta>({operation: 'update'});

        return backend.load(manager, Company, testCompanyData)
        .then(() => {
            return backend.load(manager, Developer, testDeveloperData);
        })
        .then(() => {
            // Assert that stored data matches testData
            for (let i = 0; i < testCompanyData.length; i++) {
                expect(backend._storage['Company'][i])
                    .to.deep.equal(testCompanyData[i]);
            }
            for (let i = 0; i < testDeveloperData.length; i++) {
                expect(backend._storage['Developer'][i])
                    .to.deep.equal(testDeveloperData[i]);
            }
        });
    });

    // it('updates all records with non-undefined model fields when where clause = {}', () => {
    //     let model = new Developer();
    //     model.name = 'bob';
    //     return backend.update(manager, model, {}, companyUpdateResult, options)
    //         .then((res) => {
    //             let storage = backend._storage['TestModel'];
    //             expect(res.success).to.be.true;
    //             expect(res.result).to.be.undefined;
    //             expect(res.results).to.be.undefined;
    //             expect(res.meta.total_count).to.equal(testData.length);
    //             expect(storage[0].name).to.equal(model.name);
    //             expect(storage[1].name).to.equal(model.name);
    //             expect(storage[2].name).to.equal(model.name);
    //             expect(storage[0].age).to.equal(testData[0].age);
    //             expect(storage[1].age).to.equal(testData[1].age);
    //             expect(storage[2].age).to.equal(testData[2].age);
    //         });
    // });

    // it('updates filtered records with non-undefined model fields when where clause is set', () => {
    //     let model = new TestModel();
    //     model.name = 'gertrude';
    //     model.gender = 'female';
    //     return backend.update(manager, model, {
    //         id: { _gt: 0, _lt: 3 }
    //     }, companyUpdateResult, {})
    //         .then((res) => {
    //             let storage = backend._storage['TestModel'];
    //             expect(res.success).to.be.true;
    //             expect(res.result).to.be.undefined;
    //             expect(res.results).to.be.undefined;
    //             expect(res.meta.total_count).to.equal(2);
    //             expect(storage[0].name).to.equal(testData[0].name);
    //             expect(storage[1].name).to.equal(model.name);
    //             expect(storage[2].name).to.equal(model.name);
    //             expect(storage[0].gender).to.equal(testData[0].gender);
    //             expect(storage[1].gender).to.equal(model.gender);
    //             expect(storage[2].gender).to.equal(model.gender);
    //             expect(storage[0].age).to.equal(testData[0].age);
    //             expect(storage[1].age).to.equal(testData[1].age);
    //             expect(storage[2].age).to.equal(testData[2].age);
    //         });
    // });

    // it('updates records with specific fields when options.fields is set', () => {
    //     let model = new TestModel();
    //     model.id = 99;
    //     model.name = 'gertrude';
    //     model.gender = 'female';
    //     model.age = 112;
    //     model.newsletter = false;
    //     return backend.update(manager, model, { id: 2 }, companyUpdateResult, {
    //         fields: ['age']
    //     })
    //         .then((res) => {
    //             let storage = backend._storage['TestModel'];
    //             expect(res.success).to.be.true;
    //             expect(res.result).to.be.undefined;
    //             expect(res.results).to.be.undefined;
    //             expect(res.meta.total_count).to.equal(1);
    //             expect(storage[2].id).to.equal(testData[2].id);
    //             expect(storage[2].name).to.equal(testData[2].name);
    //             expect(storage[2].gender).to.equal(testData[2].gender);
    //             expect(storage[2].age).to.equal(model.age);
    //             expect(storage[2].newsletter).to.equal(testData[2].newsletter);
    //         });
    // });

    // it('throws an error if where clause is not provided', () => {
    //     let model = new TestModel();
    //     return backend.update(manager, model, null, companyUpdateResult, {})
    //         .then(() => { throw new Error('expected to reject'); })
    //         .catch((err) => {
    //             expect(err.message).to.contain('update() requires the \'where\' parameter');
    //         });
    // });

    // it('throws when an invalid query is specified', () => {
    //     let model = new TestModel();
    //     return backend.update(manager, model, {
    //             non_existent_field: 42
    //         }, companyUpdateResult, {})
    //         .then(() => { throw new Error('expected to reject'); })
    //         .catch((err) => {
    //             expect(err.message).to.contain('not a recognised field');
    //         });
    // });

});
