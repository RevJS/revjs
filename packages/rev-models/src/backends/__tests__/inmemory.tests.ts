
import { expect } from 'chai';
import { InMemoryBackend } from '../inmemory';
import { IModelMeta, initialiseMeta } from '../../models/meta';
import * as fld from '../../fields';
import { ModelOperationResult } from '../../operations/operationresult';

describe('rev.backends.inmemory', () => {

    class TestModel {
        name: string;
        age: number;
        gender: string;
        newsletter: boolean;
        date_registered: Date;

        getDescription?() {
            return `${this.name}, age ${this.age}`;
        }
    }

    let testData: TestModel[] = [
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

    let GENDERS = [
        ['male', 'Male'],
        ['female', 'Female']
    ];

    let meta: IModelMeta;
    let backend: InMemoryBackend;
    let loadResult: ModelOperationResult<TestModel>;
    let readResult: ModelOperationResult<TestModel>;

    beforeEach(() => {
        meta = {
            fields: [
                new fld.TextField('name'),
                new fld.IntegerField('age', { required: false }),
                new fld.SelectionField('gender', {selection: GENDERS}),
                new fld.BooleanField('newsletter'),
                new fld.DateField('date_registered')
            ]
        };
        initialiseMeta(TestModel, meta);
        backend = new InMemoryBackend();
        loadResult = new ModelOperationResult<TestModel>({name: 'create'});
        readResult = new ModelOperationResult<TestModel>({name: 'read'});
    });

    describe('initial state - singleton model', () => {

        it('read() returns a model instance result with all undefined values', () => {
            meta.singleton = true;
            return backend.read(TestModel, meta, null, readResult)
                .then(() => {
                    expect(readResult.result).to.be.instanceOf(TestModel);
                    expect(readResult.results).to.be.null;
                    expect(readResult.result.getDescription).to.be.a('function');
                    for (let field of meta.fields) {
                        expect(readResult.result[field.name]).to.be.undefined;
                    }
                });
        });

    });

    describe('initial state - non-singleton model', () => {

        it('read() returns an empty list', () => {
            return backend.read(TestModel, meta, {}, readResult)
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
            backend.load(testData, meta, loadResult);
            return backend.read(TestModel, meta, {}, readResult)
                .then(() => {
                    expect(readResult.result).to.be.null;
                    expect(readResult.results).to.deep.equal(testData);
                });
        });

    });

});
