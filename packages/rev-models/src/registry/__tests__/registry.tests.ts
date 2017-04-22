import { expect } from 'chai';
import { IntegerField, TextField, DateField } from '../../fields';

import * as registry from '../registry';
import * as d from '../../decorators';
import { Model } from '../../models/model';
import { IBackend } from '../../backends/backend';
import { InMemoryBackend } from '../../backends/inmemory/backend';

class TestModel extends Model {
    id: number = 1;
    name: string = 'A Test Model';
    date: Date = new Date();
}

class TestModel2 extends Model {}

class EmptyModel extends Model {}

describe('ModelRegistry', () => {
    let testReg: registry.ModelRegistry;
    let testBackend: IBackend;

    beforeEach(() => {
        testReg = new registry.ModelRegistry();
        testBackend = {
            create: () => {},
            read: () => {},
            update: () => {},
            remove: () => {}
        } as any;
        TestModel.meta = {
            fields: [
                new IntegerField('id'),
                new TextField('name'),
                new DateField('date')
            ]
        };
        TestModel2.meta = { fields: [] };
    });

    describe('constructor()', () => {

        it('creates a registry with no models and no backends', () => {
            expect(testReg.getModelNames()).to.have.length(0);
            expect(testReg.getBackendNames()).to.have.length(0);
        });

    });

    describe('isRegistered()', () => {

        it('returns false when a model is not registered', () => {
            expect(testReg.isRegistered('TestModel')).to.equal(false);
        });

        it('returns true when a model is registered', () => {
            testReg.register(TestModel);
            expect(testReg.isRegistered('TestModel')).to.equal(true);
        });

        it('returns false when a non-string is passed', () => {
            expect(testReg.isRegistered(22 as any)).to.equal(false);
        });

        it('returns false when an object is passed', () => {
            expect(testReg.isRegistered({test: 1} as any)).to.equal(false);
        });

    });

    describe('register()', () => {

        it('adds a valid model to the registry', () => {
            testReg.register(TestModel);
            expect(testReg.getModel('TestModel')).to.equal(TestModel);
        });

        it('adds a decorated model to the registry.', () => {
            class DecoratedModel extends Model {
                @d.TextField()
                    name: string;
                @d.IntegerField()
                    age: number;
            }
            testReg.register(DecoratedModel);
            expect(testReg.getModel('DecoratedModel')).to.equal(DecoratedModel);
        });

        it('rejects a non-model constructor with a ModelError', () => {
            expect(() => {
                testReg.register({} as any);
            }).to.throw('ModelError');
        });

        it('throws an error if model already exists', () => {
            testReg.register(TestModel);
            expect(() => {
                testReg.register(TestModel);
            }).to.throw('already exists in the registry');
        });

        it('should initialise metadata', () => {
            testReg.register(TestModel);
            expect(TestModel.meta.fieldsByName).to.be.an('object');
        });

        it('throws an error if metadata cannot be initialised', () => {
            expect(() => {
                testReg.register(EmptyModel);
            }).to.throw('MetadataError');
        });

    });

    describe('getModelNames()', () => {

        it('should get the names of the models', () => {
            expect(testReg.getModelNames()).to.deep.equal([]);
            testReg.register(TestModel);
            expect(testReg.getModelNames()).to.deep.equal(['TestModel']);
            testReg.register(TestModel2);
            expect(testReg.getModelNames()).to.deep.equal(['TestModel', 'TestModel2']);
        });

    });

    describe('getModel()', () => {

        it('should return model prototype', () => {
            testReg.register(TestModel);
            expect(testReg.getModel('TestModel')).to.equal(TestModel);
        });

        it('should throw an error if the model does not exist', () => {
            expect(() => {
                testReg.getModel('Flibble');
            }).to.throw('does not exist in the registry');
            testReg.register(TestModel);
            expect(() => {
                testReg.getModel('Jibble');
            }).to.throw('does not exist in the registry');
        });

    });

    describe('setBackend()', () => {

        it('successfully configures the default backend', () => {
            testReg.setBackend('default', testBackend);
            expect(testReg.getBackend('default')).to.equal(testBackend);
        });

        it('successfully configures a new valid backend', () => {
            testReg.setBackend('my_db', testBackend);
            expect(testReg.getBackend('my_db')).to.equal(testBackend);
        });

        it('successfully configured an InMemory backend', () => {
            let backend = new InMemoryBackend();
            testReg.setBackend('default', backend);
            expect(testReg.getBackend('default')).to.equal(backend);
        });

        it('throws an error when backendName is not specified', () => {
            expect(() => {
                testReg.setBackend(undefined, undefined);
            }).to.throw('you must specify a name');
        });

        it('throws an error when backend is not an object', () => {
            expect(() => {
                testReg.setBackend('my_backend', (() => {}) as any);
            }).to.throw('you must pass an instance of a backend class');
        });

        it('throws an error when backend is missing one or more methods', () => {
            expect(() => {
                testReg.setBackend('my_backend', {} as any);
            }).to.throw('the specified backend does not fully implement the IBackend interface');
        });

    });

    describe('getBackend()', () => {

        it('gets a backend', () => {
            testReg.setBackend('my_db', testBackend);
            expect(testReg.getBackend('my_db')).to.equal(testBackend);
        });

        it('throws an error if backendName not specified', () => {
            expect(() => {
                testReg.getBackend(undefined);
            }).to.throw('you must specify the name of the backend to get');
        });

        it('throws an error if backendName has not been configured', () => {
            expect(() => {
                testReg.getBackend('non-configured-backend');
            }).to.throw('has has not been configured');
        });

    });

});
