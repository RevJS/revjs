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
                new IntegerField('id', 'Id'),
                new TextField('name', 'Name'),
                new DateField('date', 'Date')
            ]
        };
        testMeta2 = { fields: [] };
    });

    it('throws an error if fields metadata is missing', () => {
        expect(() => {
            initialiseMeta(TestModel, null);
        }).to.throw('Model metadata must contain a "fields" definition');
        expect(() => {
            initialiseMeta(TestModel, <IModelMeta<TestModel>> {});
        }).to.throw('Model metadata must contain a "fields" definition');
    });

    it('throws an error if fields array contains invalid items', () => {
        expect(() => {
            initialiseMeta(TestModel, {
                fields: [
                    new TextField('flibble', 'Jibble'),
                    <IntegerField> getAnyObject()
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
                    new TextField('flibble', 'Jibble'),
                    new TextField('wibble', 'Some Field'),
                    new IntegerField('flibble', 'The Duplicate')
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

    it('should set up meta.storage ("default" if not defined)', () => {
        testMeta.storage = undefined;
        testMeta2.storage = 'main_db';
        initialiseMeta(TestModel, testMeta);
        initialiseMeta(TestModel2, testMeta2);
        expect(testMeta.storage).to.equal('default');
        expect(testMeta2.storage).to.equal('main_db');
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
            @d.IntegerField('ID')
                id: number;
            @d.TextField('Name')
                name: string;
            @d.BooleanField('Active?')
                active: boolean;
        }
        let meta = initialiseMeta(MyClass);
        expect(meta.fields).to.have.length(3);
        expect(meta.fieldsByName).to.have.keys('id', 'name', 'active');
    });

    it('decorator metadata is added to existing metadata', () => {
        class MyClass {
            @d.IntegerField('ID')
                id: number;
            @d.TextField('Name')
                name: string;
            @d.BooleanField('Active?')
                active: boolean;
        }
        let baseMeta: IModelMeta<MyClass> = {
            fields: [
                new TextField('flibble', 'Flibble')
            ]
        };
        let meta = initialiseMeta(MyClass, baseMeta);
        expect(meta.fields).to.have.length(4);
        expect(meta.fieldsByName).to.have.keys('flibble', 'id', 'name', 'active');
    });

    it('removes the __fields property once it has been transferred to metadata', () => {
        class MyClass {
            @d.TextField('Name')
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
            @d.TextField('Name')
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
