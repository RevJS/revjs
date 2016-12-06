import { NumberField } from './../../fields/index';
import { IModelMeta } from './../../model/index';
import { expect } from 'chai';
import { IntegerField, TextField, DateField } from '../../fields';

import * as registry from '../index';

class TestModel {
    id: number = 1;
    name: string = 'A Test Model';
    date: Date = new Date();
}

let testMeta: IModelMeta<TestModel> = {
    fields: [
        new IntegerField('id', 'Id'),
        new TextField('name', 'Name'),
        new DateField('date', 'Date')
    ]
};

class TestModel2 {}
let testMeta2: IModelMeta<TestModel2> = { fields: [] };

function getAnyObject() {
    return Object.assign({});
}

describe('ModelRegistry', () => {
    let testReg: registry.ModelRegistry;

    beforeEach(() => {
        testReg = new registry.ModelRegistry();
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
                testReg.register(<Function> {}, testMeta);
            }).to.throw('ModelError');
        });

        it('throws an error if model already exists', () => {
            testReg.register(TestModel, testMeta);
            expect(() => {
                testReg.register(TestModel, testMeta);
            }).to.throw('already exists in the registry');
        });

        it('throws an error if fields are not defined', () => {
            expect(() => {
                testReg.register(TestModel, <IModelMeta<TestModel>> {});
            }).to.throw('Model metadata must contain a "fields" definition');
        });

        // Metadata tests

        it('throws an error if fields metadata is missing', () => {
            expect(() => {
                testReg.register(TestModel, null);
            }).to.throw('Model metadata must contain a "fields" definition');
            expect(() => {
                testReg.register(TestModel, <IModelMeta<TestModel>> {});
            }).to.throw('Model metadata must contain a "fields" definition');
        });

        it('throws an error if fields array contains invalid items', () => {
            expect(() => {
                testReg.register(TestModel, {
                    fields: [
                        new TextField('flibble', 'Jibble'),
                        <IntegerField> getAnyObject()
                    ]
                });
            }).to.throw('is not an instance of rev.Field');
        });

        it('if meta.name is passed, it must match the model name', () => {
            expect(() => {
                testReg.register(TestModel, {
                    name: 'Flibble',
                    fields: []
                });
            }).to.throw('Model name does not match meta.name');
            expect(() => {
                testReg.register(TestModel, {
                    name: 'TestModel',
                    fields: []
                });
            }).to.not.throw();
        });

        it('should set up meta.storage ("default" if not defined)', () => {
            testReg.register(TestModel, { fields: [] });
            testReg.register(TestModel2, {
                fields: [],
                storage: 'main_db'
            });
            expect(testReg.getMeta('TestModel').storage).to.equal('default');
            expect(testReg.getMeta('TestModel2').storage).to.equal('main_db');
        });

        it('should set up meta.label (if not set, should equal model name)', () => {
            testReg.register(TestModel, { fields: [] });
            testReg.register(TestModel2, {
                fields: [],
                label: 'Awesome Entity'
            });
            expect(testReg.getMeta('TestModel').label).to.equal('TestModel');
            expect(testReg.getMeta('TestModel2').label).to.equal('Awesome Entity');
        });

        it('should set up meta.singleton (defaults to false)', () => {
            testReg.register(TestModel, { fields: [] });
            testReg.register(TestModel2, {
                fields: [],
                singleton: true
            });
            expect(testReg.getMeta('TestModel').singleton).to.equal(false);
            expect(testReg.getMeta('TestModel2').singleton).to.equal(true);
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
