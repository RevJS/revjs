
import { expect } from 'chai';

import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../backend';
import { ModelOperationResult } from '../../../operations/operationresult';
import { TestModel, testData } from './testdata';
import { IUpdateOptions, IUpdateMeta } from '../../../models/types';

describe('rev.backends.inmemory', () => {

    let manager: ModelManager;
    let options: IUpdateOptions;
    let backend: InMemoryBackend;
    let updateResult: ModelOperationResult<TestModel, IUpdateMeta>;

    beforeEach(() => {
        manager = new ModelManager();
        options = {};
        backend = new InMemoryBackend();
        manager.registerBackend('default', backend);
        manager.register(TestModel);
        updateResult = new ModelOperationResult<TestModel, IUpdateMeta>({operation: 'update'});
    });

    describe('update() - with no data', () => {

        it('returns with totalCount = 0 when there is no data and where clause = {}', () => {
            let model = new TestModel();
            model.id = 1;
            model.name = 'bob';
            return backend.update(manager, model, options, updateResult)
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.be.undefined;
                    expect(res.meta.totalCount).to.equal(0);
                });
        });

        it('returns with totalCount = 0 when there is no data and where clause sets a filter', () => {
            let model = new TestModel();
            model.id = 1;
            model.name = 'bob';
            return backend.update(manager, model, { where: { id: { _gte: 0 } }}, updateResult)
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.be.undefined;
                    expect(res.meta.totalCount).to.equal(0);
                });
        });

    });

    describe('update() - with data', () => {

        beforeEach(() => {
            return backend.load(manager, TestModel, testData)
            .then(() => {
                // Assert that stored data matches testData
                for (let i = 0; i < testData.length; i++) {
                    expect(backend._storage['TestModel'][i])
                        .to.deep.equal(testData[i]);
                }
            });
        });

        it('updates all records with non-undefined model fields when where clause = {}', () => {
            let model = new TestModel();
            model.name = 'bob';
            return backend.update(manager, model, options, updateResult)
                .then((res) => {
                    let storage = backend._storage['TestModel'];
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.be.undefined;
                    expect(res.meta.totalCount).to.equal(testData.length);
                    expect(storage[0].name).to.equal(model.name);
                    expect(storage[1].name).to.equal(model.name);
                    expect(storage[2].name).to.equal(model.name);
                    expect(storage[0].age).to.equal(testData[0].age);
                    expect(storage[1].age).to.equal(testData[1].age);
                    expect(storage[2].age).to.equal(testData[2].age);
                });
        });

        it('updates filtered records with non-undefined model fields when where clause is set', () => {
            let model = new TestModel();
            model.name = 'gertrude';
            model.gender = 'female';
            return backend.update(manager, model, { where: {
                id: { _gt: 0, _lt: 3 }
            }}, updateResult)
                .then((res) => {
                    let storage = backend._storage['TestModel'];
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.be.undefined;
                    expect(res.meta.totalCount).to.equal(2);
                    expect(storage[0].name).to.equal(testData[0].name);
                    expect(storage[1].name).to.equal(model.name);
                    expect(storage[2].name).to.equal(model.name);
                    expect(storage[0].gender).to.equal(testData[0].gender);
                    expect(storage[1].gender).to.equal(model.gender);
                    expect(storage[2].gender).to.equal(model.gender);
                    expect(storage[0].age).to.equal(testData[0].age);
                    expect(storage[1].age).to.equal(testData[1].age);
                    expect(storage[2].age).to.equal(testData[2].age);
                });
        });

        it('updates records with specific fields when options.fields is set', () => {
            let model = new TestModel();
            model.id = 99;
            model.name = 'gertrude';
            model.gender = 'female';
            model.age = 112;
            model.newsletter = false;
            return backend.update(manager, model, {
                where: { id: 2 },
                fields: ['age']
            }, updateResult)
                .then((res) => {
                    let storage = backend._storage['TestModel'];
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.be.undefined;
                    expect(res.meta.totalCount).to.equal(1);
                    expect(storage[2].id).to.equal(testData[2].id);
                    expect(storage[2].name).to.equal(testData[2].name);
                    expect(storage[2].gender).to.equal(testData[2].gender);
                    expect(storage[2].age).to.equal(model.age);
                    expect(storage[2].newsletter).to.equal(testData[2].newsletter);
                });
        });

        it('throws an error if where clause is not provided', () => {
            let model = new TestModel();
            return backend.update(manager, model, null, updateResult)
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('update() requires the \'where\' parameter');
                });
        });

        it('throws when an invalid query is specified', () => {
            let model = new TestModel();
            return backend.update(manager, model, { where: {
                    non_existent_field: 42
                }}, updateResult)
                .then(() => { throw new Error('expected to reject'); })
                .catch((err) => {
                    expect(err.message).to.contain('not a recognised field');
                });
        });

    });

});
