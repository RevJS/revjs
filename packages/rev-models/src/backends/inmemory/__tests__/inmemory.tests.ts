
import { expect } from 'chai';
import { InMemoryBackend } from '../backend';
import { initialiseMeta } from '../../../models/meta';
import { ModelOperationResult } from '../../../operations/operationresult';
import { Model } from '../../../models/model';
import * as d from '../../../decorators';

let GENDERS = [
    ['male', 'Male'],
    ['female', 'Female']
];

class TestModel extends Model {
    @d.TextField()
        name: string;
    @d.IntegerField({ required: false })
        age: number;
    @d.SelectionField({ required: false, selection: GENDERS })
        gender: string;
    @d.BooleanField({ required: false })
        newsletter: boolean;
    @d.DateField({ required: false })
        date_registered: Date;

    getDescription?() {
        return `${this.name}, age ${this.age}`;
    }
}

initialiseMeta(TestModel);

let testData: Array<Partial<TestModel>> = [
    {
        name: 'Joe Bloggs',
        age: 20,
        gender: 'male',
        newsletter: true,
        date_registered: new Date('2016-05-26')
    },
    {
        name: 'Jane Doe',
        age: 23,
        gender: 'female',
        newsletter: true,
        date_registered: new Date('2017-01-01')
    },
    {
        name: 'Felix The Cat',
        age: 3,
        gender: 'male',
        newsletter: false,
        date_registered: new Date('2016-12-03')
    }
];

describe('rev.backends.inmemory', () => {

    let backend: InMemoryBackend;
    let loadResult: ModelOperationResult<TestModel>;
    let createResult: ModelOperationResult<TestModel>;
    let createResult2: ModelOperationResult<TestModel>;
    let readResult: ModelOperationResult<TestModel>;

    beforeEach(() => {
        TestModel.meta.singleton = false;
        backend = new InMemoryBackend();
        loadResult = new ModelOperationResult<TestModel>({operation: 'load'});
        createResult = new ModelOperationResult<TestModel>({operation: 'create'});
        createResult2 = new ModelOperationResult<TestModel>({operation: 'create'});
        readResult = new ModelOperationResult<TestModel>({operation: 'read'});
    });

    describe('initial state - singleton model', () => {

        it('read() returns a model instance result with all undefined values', () => {
            TestModel.meta.singleton = true;
            return backend.read(TestModel, null, readResult)
                .then(() => {
                    expect(readResult.result).to.be.instanceOf(TestModel);
                    expect(readResult.results).to.be.null;
                    expect(readResult.result.getDescription).to.be.a('function');
                    for (let field of TestModel.meta.fields) {
                        expect(readResult.result[field.name]).to.be.undefined;
                    }
                });
        });

    });

    describe('initial state - non-singleton model', () => {

        it('read() returns an empty list', () => {
            return backend.read(TestModel, {}, readResult)
                .then(() => {
                    expect(readResult.result).to.be.null;
                    expect(readResult.results).to.be.instanceOf(Array);
                    expect(readResult.results.length).to.equal(0);
                });
        });

    });

    describe('load()', () => {

        it('populates InMemoryBackend._storage with data', () => {
            return backend.load(TestModel, testData, loadResult)
                .then(() => {
                    expect(backend._storage['TestModel']).to.equal(testData);
                });
        });

        it('rejects if model is a singleton', () => {
            TestModel.meta.singleton = true;
            return expect(backend.load(TestModel, testData, loadResult))
                .to.be.rejectedWith('cannot be used with a singleton model');
        });

        it('rejects if passed data is not an array of objects', () => {
            let badData = ['a', 'b', 'b', 1, 2, 3];
            return expect(backend.load(TestModel, badData as any, loadResult))
                .to.be.rejectedWith('data must be an array of objects');
        });

    });

    describe('create()', () => {

        it('stores model data as a plain object and returns a new model instance', () => {
            let model = new TestModel({
                name: 'test model',
                age: 20
            });
            return backend.create(model, createResult)
                .then((res) => {
                    expect(backend._storage['TestModel']).to.deep.equal([
                        {
                            name: 'test model',
                            age: 20
                        }
                    ]);
                    expect(res.results).to.equal(null);
                    expect(res.result).to.be.instanceof(TestModel);
                    expect(res.result).to.not.equal(model);
                    expect(res.result.name).to.equal(model.name);
                    expect(res.result.age).to.equal(model.age);
                    expect(res.result.gender).to.be.undefined;
                });
        });

        it('stores multiple records', () => {
            let model1 = new TestModel({
                name: 'test model 1',
                age: 21
            });
            let model2 = new TestModel({
                name: 'test model 2',
                age: 22
            });
            return Promise.all([
                backend.create(model1, createResult),
                backend.create(model2, createResult2)
            ])
                .then((res) => {
                    expect(backend._storage['TestModel']).to.deep.equal([
                        {
                            name: 'test model 1',
                            age: 21
                        },
                        {
                            name: 'test model 2',
                            age: 22
                        }
                    ]);
                    expect(res[0].result).to.be.instanceof(TestModel);
                    expect(res[1].result).to.be.instanceof(TestModel);
                    expect(res[0].result).to.not.equal(model1);
                    expect(res[1].result).to.not.equal(model2);
                    expect(res[0].result.name).to.equal(model1.name);
                    expect(res[1].result.name).to.equal(model2.name);
                });
        });

        it('rejects if model is a singleton', () => {
            let model = new TestModel({ name: 'test model' });
            TestModel.meta.singleton = true;
            return expect(backend.create(model, createResult))
                .to.be.rejectedWith('cannot be used with a singleton model');
        });

    });

    describe('read()', () => {

        // TODO TEST QUERIES + LIMIT

        it('returns all records when where clause = {}', () => {
            backend.load(TestModel, testData, loadResult);
            return backend.read(TestModel, {}, readResult)
                .then(() => {
                    expect(readResult.result).to.be.null;
                    expect(readResult.results).to.have.length(testData.length);
                });
        });

    });

});
