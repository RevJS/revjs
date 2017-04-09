
import { expect } from 'chai';
import { InMemoryBackend } from '../inmemory';
import { initialiseMeta } from '../../models/meta';
import { ModelOperationResult } from '../../operations/operationresult';
import { Model } from '../../models/model';
import * as d from '../../decorators';

let GENDERS = [
    ['male', 'Male'],
    ['female', 'Female']
];

class TestModel extends Model {
    @d.TextField()
        name: string;
    @d.IntegerField({ required: false })
        age: number;
    @d.SelectionField({ selection: GENDERS })
        gender: string;
    @d.BooleanField()
        newsletter: boolean;
    @d.DateField()
        date_registered: Date;

    getDescription?() {
        return `${this.name}, age ${this.age}`;
    }
}

initialiseMeta(TestModel);

let testData: TestModel[] = [
    new TestModel({
        name: 'Joe Bloggs',
        age: 20,
        gender: 'male',
        newsletter: true,
        date_registered: new Date('2016-05-26')
    }),
    new TestModel({
        name: 'Jane Doe',
        age: 23,
        gender: 'female',
        newsletter: true,
        date_registered: new Date('2017-01-01')
    }),
    new TestModel({
        name: 'Felix The Cat',
        age: 3,
        gender: 'male',
        newsletter: false,
        date_registered: new Date('2016-12-03')
    })
];

describe('rev.backends.inmemory', () => {

    let backend: InMemoryBackend;
    let loadResult: ModelOperationResult<TestModel>;
    let readResult: ModelOperationResult<TestModel>;

    beforeEach(() => {
        TestModel.meta.singleton = false;
        backend = new InMemoryBackend();
        loadResult = new ModelOperationResult<TestModel>({operation: 'create'});
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

    describe('read()', () => {

        // TODO TEST LIMIT

        it('returns all records when where clause = {}', () => {
            backend.load(testData, TestModel, loadResult);
            return backend.read(TestModel, {}, readResult)
                .then(() => {
                    expect(readResult.result).to.be.null;
                    expect(readResult.results).to.deep.equal(testData);
                });
        });

    });

});
