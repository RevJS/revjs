import { ModelOperationResult } from '../operations';
import * as operations from '../operations';
import * as sinon from 'sinon';
import * as rewire from 'rewire';

import { expect } from 'chai';
import { IModelMeta, initialiseMeta } from '../meta';
import { IntegerField, TextField, SelectionField, EmailField } from '../../fields';

describe('rev.model.operations', () => {

    class TestModel {
        name: string;
        gender: string;
        age: number;
        email: string;
    }

    let GENDERS = [
        ['male', 'Male'],
        ['female', 'Female']
    ];

    let testMeta: IModelMeta<TestModel>;

    beforeEach(() => {
        testMeta = {
            fields: [
                new TextField('name', 'Name'),
                new SelectionField('gender', 'Gender', GENDERS),
                new IntegerField('age', 'Age', { required: false, minValue: 10 }),
                new EmailField('email', 'E-mail', { required: false })
            ]
        };
        initialiseMeta(TestModel, testMeta);
    });

    describe('ModelOperationResult - constructor()', () => {

        it('sets up an empty result as expected', () => {
            let res = new ModelOperationResult('create');
            expect(res.success).to.equal(true);
            expect(res.operation).to.equal('create');
            expect(res.errors).to.deep.equal([]);
            expect(res.validation).to.be.null;
            expect(res.results).to.be.null;
        });

    });

    describe('ModelOperationResult - addError()', () => {

        let res: ModelOperationResult<{}>;

        beforeEach(() => {
            res = new ModelOperationResult('create');
        });

        it('adds an error with specified message', () => {
            res.addError('The database has exploded!');
            expect(res.errors).to.deep.equal([
                {
                    message: 'The database has exploded!'
                }
            ]);
        });

        it('adds an error with message and data', () => {
            res.addError('The database has exploded!', {dbms: 'SQL Server'});
            expect(res.errors).to.deep.equal([
                {
                    message: 'The database has exploded!',
                    dbms: 'SQL Server'
                }
            ]);
        });

        it('adds a second error with specified message', () => {
            res.addError('Silly operation!');
            res.addError('This function has performed an illegal operation.');
            expect(res.errors).to.deep.equal([
                {
                    message: 'Silly operation!'
                },
                {
                    message: 'This function has performed an illegal operation.'
                }
            ]);
        });

        it('adds a second modelError with message and data', () => {
            res.addError('Silly operation!');
            res.addError('E-roar', {data: 42});
            expect(res.errors).to.deep.equal([
                {
                    message: 'Silly operation!'
                },
                {
                    message: 'E-roar',
                    data: 42
                }
            ]);
        });

        it('sets valid to false when error is added', () => {
            expect(res.success).to.equal(true);
            res.addError('fail!');
            expect(res.success).to.equal(false);
        });

        it('throws an error when no message is specified', () => {
            expect(() => {
                res.addError(undefined);
            }).to.throw('A message must be specified for the operation error');
        });

        it('throws an error if data is not an object', () => {
            expect(() => {
                res.addError('Operation took too long', 1000000);
            }).to.throw('You cannot add non-object data to an operation result');
        });

    });

    describe('create()', () => {

        let storageSpy: {
            create: sinon.SinonSpy;
        };

        let rwOps = rewire('../operations');
        let ops: typeof operations & typeof rwOps = <any> rwOps;
        ops.__set__({
            registry_1: {
                registry: {
                    getMeta: (modeName: string) => {
                        return testMeta;
                    }
                }
            },
            storage: {
                get: (storageName: string) => {
                    return storageSpy;
                }
            }
        });

        beforeEach(() => {
            storageSpy = {
                create: sinon.spy((model: any, meta: any, result: any) => {
                    return Promise.resolve(result);
                })
            };
        });

        it('calls storage.create() and returns result if model is valid', () => {
            let model = new TestModel();
            model.name = 'Bob';
            model.gender = 'male';
            return ops.create(model)
                .then((res) => {
                    expect(storageSpy.create.callCount).to.equal(1);
                    let createCall = storageSpy.create.getCall(0);
                    expect(createCall.args[0]).to.equal(model);
                    expect(createCall.args[1]).to.equal(testMeta);
                    expect(res.success).to.be.true;
                });
        });

    });

});
