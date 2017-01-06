import { IModelMeta } from './../../model/meta';
import { expect } from 'chai';
import { IntegerField, TextField, DateField } from '../../fields';

import * as registry from '../index';

class TestModel {
    id: number = 1;
    name: string = 'A Test Model';
    date: Date = new Date();
}

class TestModel2 {}

let testMeta: IModelMeta<TestModel>;
let testMeta2: IModelMeta<TestModel2>;

describe('ModelRegistry', () => {
    let testReg: registry.ModelRegistry;

    beforeEach(() => {
        testReg = new registry.ModelRegistry();
        testMeta = {
            fields: [
                new IntegerField('id', 'Id'),
                new TextField('name', 'Name'),
                new DateField('date', 'Date')
            ]
        };
        testMeta2 = { fields: [] };
    });

    describe('constructor()', () => {

        it('creates a registry with no models', () => {
            expect(testReg.getModelNames()).to.have.length(0);
        });

    });

    describe('register()', () => {

        it('adds a valid model to the registry', () => {
            testReg.register(TestModel, testMeta);
            expect(testReg.getProto('TestModel')).to.equal(TestModel);
            expect(testReg.getMeta('TestModel')).to.equal(testMeta);
        });

        it('rejects a non-model constructor with a ModelError', () => {
            expect(() => {
                testReg.register(<any> {}, testMeta);
            }).to.throw('ModelError');
        });

        it('throws an error if model already exists', () => {
            testReg.register(TestModel, testMeta);
            expect(() => {
                testReg.register(TestModel, testMeta);
            }).to.throw('already exists in the registry');
        });

        it('should initialise metadata', () => {
            testReg.register(TestModel, testMeta);
            expect(testMeta.fieldsByName).to.be.an('object');
        });
    });

    describe('getModelNames()', () => {

        it('should get the names of the models', () => {
            expect(testReg.getModelNames()).to.deep.equal([]);
            testReg.register(TestModel, testMeta);
            expect(testReg.getModelNames()).to.deep.equal(['TestModel']);
            testReg.register(TestModel2, testMeta2);
            expect(testReg.getModelNames()).to.deep.equal(['TestModel', 'TestModel2']);
        });

    });

    describe('getProto()', () => {

        it('should return model prototype', () => {
            testReg.register(TestModel, testMeta);
            expect(testReg.getProto('TestModel')).to.equal(TestModel);
        });

        it('should throw an error if the model does not exist', () => {
            expect(() => {
                testReg.getProto('Flibble');
            }).to.throw('does not exist in the registry');
            testReg.register(TestModel, testMeta);
            expect(() => {
                testReg.getProto('Jibble');
            }).to.throw('does not exist in the registry');
        });

    });

    describe('getMeta()', () => {

        it('should return model metadata', () => {
            testReg.register(TestModel, testMeta);
            expect(testReg.getMeta('TestModel')).to.equal(testMeta);
        });

        it('should throw an error if the model does not exist', () => {
            expect(() => {
                testReg.getMeta('Flibble');
            }).to.throw('does not exist in the registry');
            testReg.register(TestModel, testMeta);
            expect(() => {
                testReg.getMeta('Jibble');
            }).to.throw('does not exist in the registry');
        });

    });

    describe('rev.registry', () => {

        it('should be an instance of ModelRegistry', () => {
            expect(registry.registry)
                .to.be.an.instanceOf(registry.ModelRegistry);
        });

    });

    describe('rev.register()', () => {

        it('should add models to the shared registry', () => {
            registry.registry.register(TestModel, testMeta);
            expect(registry.registry.getMeta('TestModel')).to.equal(testMeta);
        });

        it('should throw an error if something goes wrong', () => {
            expect(() => {
                registry.registry.register(TestModel, testMeta);
            }).to.throw('already exists in the registry');
        });

    });
});
