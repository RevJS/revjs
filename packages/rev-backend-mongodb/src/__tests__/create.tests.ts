
import { expect } from 'chai';

import { ModelManager } from 'rev-models';
import { ModelOperationResult } from 'rev-models/lib/operations/operationresult';
import { TestModel, clearTestData } from './testdata';
import { DEFAULT_CREATE_OPTIONS } from 'rev-models/lib//operations/create';
import { ICreateMeta } from 'rev-models/lib//models/types';
import { MongoDBBackend } from '../backend';
import { testConfig } from './testconfig';
import { MongoClient, Db } from 'mongodb';

describe('MongoDBBackend.create()', () => {

    let manager: ModelManager;
    let backend: MongoDBBackend;
    let mongoClient: MongoClient;
    let mongoDB: Db;
    let createResult: ModelOperationResult<TestModel, ICreateMeta>;

    before(async () => {
        backend = new MongoDBBackend(testConfig);
        await backend.connect();
        mongoClient = backend.getMongoClient();
        mongoDB = mongoClient.db(testConfig.dbName);
        await clearTestData(mongoDB);
    });
    after(() => {
        backend.disconnect();
    });

    beforeEach(() => {
        manager = new ModelManager();
        manager.registerBackend('default', backend);
        manager.register(TestModel);
        createResult = new ModelOperationResult<TestModel, ICreateMeta>({operation: 'create'});
    });

    it('stores valid model data and returns a new model instance', async () => {
        let model = new TestModel();
        model.id = 1;
        model.name = 'test model';
        model.age = 20;
        const res = await backend.create(manager, model, DEFAULT_CREATE_OPTIONS, createResult);

        const records = await mongoDB.collection('TestModel')
                                .find<TestModel>({ id: 1 })
                                .limit(2)
                                .toArray();
        expect(records).to.have.length(1);
        expect(records[0]).to.include({
            id: 1,
            name: 'test model',
            age: 20
        });

        expect(res.results).to.be.undefined;
        expect(res.result).to.be.instanceof(TestModel);
        expect(res.result).to.not.equal(model);
        expect(res.result.name).to.equal(model.name);
        expect(res.result.age).to.equal(model.age);
        expect(res.result.gender).to.be.undefined;

    });

});