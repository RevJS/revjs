import { Field } from '../../fields/index';
import { IModelMeta, initialiseMeta } from '../meta';
import { expect } from 'chai';
import { IntegerField, TextField, DateField } from '../../fields';
import * as d from '../../decorators';

class TestModel {
    id: number = 1;
    name: string = 'A Test Model';
    date: Date = new Date();
}

class TestModel2 {}

let testMeta: IModelMeta<TestModel>;
let testMeta2: IModelMeta<TestModel2>;

function getAnyObject() {
    return Object.assign({});
}

describe('initialiseMeta() - metadata only', () => {

    beforeEach(() => {
        testMeta = {
            fields: [
                new IntegerField('id'),
                new TextField('name'),
                new DateField('date')
            ]
        };
        testMeta2 = { fields: [] };
    });

    it('throws an error if fields metadata is missing', () => {
        expect(() => {
            initialiseMeta(TestModel, null);
        }).to.throw('You must define the fields metadata for the model');
        expect(() => {
            initialiseMeta(TestModel, {} as IModelMeta<TestModel>);
        }).to.throw('You must define the fields metadata for the model');
    });

    it('throws an error if fields array contains invalid items', () => {
        expect(() => {
            initialiseMeta(TestModel, {
                fields: [
                    new TextField('flibble'),
                    getAnyObject() as IntegerField
                ]
            });
        }).to.throw('is not an instance of rev.Field');
    });

    it('if meta.name is passed, it must match the model name', () => {
        expect(() => {
            initialiseMeta(TestModel, {
                name: 'Flibble',
                fields: []
            });
        }).to.throw('Model name does not match meta.name');
        expect(() => {
            initialiseMeta(TestModel, {
                name: 'TestModel',
                fields: []
            });
        }).to.not.throw();
    });

    it('throws an error if a field name is defined twice', () => {
        expect(() => {
            initialiseMeta(TestModel, {
                fields: [
                    new TextField('flibble'),
                    new TextField('wibble'),
                    new IntegerField('flibble')
                ]
            });
        }).to.throw('Field "flibble" is defined more than once');
    });

    it('creates the fieldsByName property as expected', () => {
        initialiseMeta(TestModel, testMeta);
        let fieldNames = testMeta.fields.map((f) => f.name);
        expect(Object.keys(testMeta.fieldsByName)).to.deep.equal(fieldNames);
        expect(testMeta.fieldsByName[fieldNames[0]]).to.be.instanceOf(Field);
    });

    it('should set up meta.backend ("default" if not defined)', () => {
        testMeta.backend = undefined;
        testMeta2.backend = 'main_db';
        initialiseMeta(TestModel, testMeta);
        initialiseMeta(TestModel2, testMeta2);
        expect(testMeta.backend).to.equal('default');
        expect(testMeta2.backend).to.equal('main_db');
    });

    it('should set up meta.label (if not set, should equal model name)', () => {
        testMeta.label = undefined;
        testMeta2.label = 'Awesome Entity';
        initialiseMeta(TestModel, testMeta);
        initialiseMeta(TestModel2, testMeta2);
        expect(testMeta.label).to.equal('TestModel');
        expect(testMeta2.label).to.equal('Awesome Entity');
    });

    it('should set up meta.singleton (defaults to false)', () => {
        testMeta.singleton = undefined;
        testMeta2.singleton = true;
        initialiseMeta(TestModel, testMeta);
        initialiseMeta(TestModel2, testMeta2);
        expect(testMeta.singleton).to.equal(false);
        expect(testMeta2.singleton).to.equal(true);
    });

});

describe('initialiseMeta() - with decorators', () => {

    it('creates metadata as expected when only decorators are used', () => {
        class MyClass {
            @d.IntegerField()
                id: number;
            @d.TextField()
                name: string;
            @d.BooleanField()
                active: boolean;
        }
        let meta = initialiseMeta(MyClass);
        expect(meta.fields).to.have.length(3);
        expect(meta.fieldsByName).to.have.keys('id', 'name', 'active');
    });

    it('decorator metadata is added to empty metadata', () => {
        class MyClass {
            @d.IntegerField()
                id: number;
            @d.TextField()
                name: string;
            @d.BooleanField()
                active: boolean;
        }
        let meta = initialiseMeta(MyClass, {});
        expect(meta.fields).to.have.length(3);
        expect(meta.fieldsByName).to.have.keys('id', 'name', 'active');
    });

    it('decorator metadata is added to existing metadata', () => {
        class MyClass {
            @d.IntegerField()
                id: number;
            @d.TextField()
                name: string;
            @d.BooleanField()
                active: boolean;
        }
        let baseMeta: IModelMeta<MyClass> = {
            fields: [
                new TextField('flibble')
            ]
        };
        let meta = initialiseMeta(MyClass, baseMeta);
        expect(meta.fields).to.have.length(4);
        expect(meta.fieldsByName).to.have.keys('flibble', 'id', 'name', 'active');
    });

    it('removes the __fields property once it has been transferred to metadata', () => {
        class MyClass {
            @d.TextField()
                name: string;
        }
        expect((MyClass.prototype as any).__fields).to.be.an('Array');
        initialiseMeta(MyClass);
        expect((MyClass.prototype as any).__fields).to.be.undefined;
    });

    it('throws an error if for some reason prototype.__fields is not an array', () => {
        class MyClass {}
        (MyClass.prototype as any).__fields = 'flibble';
        expect(() => {
            initialiseMeta(MyClass);
        }).to.throw('Model __fields property must be an array');
    });

    it('throws an error if meta.fields is not an array', () => {
        class MyClass {
            @d.TextField()
                name: string;
        }
        let meta: any = {
            fields: {}
        };
        expect(() => {
            initialiseMeta(MyClass, meta);
        }).to.throw('fields entry must be an array');
    });

});
