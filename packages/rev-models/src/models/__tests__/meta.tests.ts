import { Field } from '../../fields/index';
import { initialiseMeta } from '../meta';
import { expect } from 'chai';
import { IntegerField, TextField, DateField } from '../../fields';
import * as d from '../../decorators';
import { Model } from '../model';

class TestModel extends Model {
    id: number = 1;
    name: string = 'A Test Model';
    date: Date = new Date();
}

class TestModel2 extends Model {}

function getAnyObject() {
    return Object.assign({});
}

describe('initialiseMeta() - metadata only', () => {

    beforeEach(() => {
        TestModel.meta = {
            fields: [
                new IntegerField('id'),
                new TextField('name'),
                new DateField('date')
            ]
        };
        TestModel2.meta = { fields: [] };
    });

    it('throws an error if fields metadata is missing', () => {
        expect(() => {
            TestModel.meta = null;
            initialiseMeta(TestModel);
        }).to.throw('You must define the fields metadata for the model');
        expect(() => {
            TestModel.meta = {};
            initialiseMeta(TestModel);
        }).to.throw('You must define the fields metadata for the model');
    });

    it('throws an error if fields array contains invalid items', () => {
        expect(() => {
            TestModel.meta = {
                fields: [
                    new TextField('flibble'),
                    getAnyObject() as IntegerField
                ]
            };
            initialiseMeta(TestModel);
        }).to.throw('is not an instance of rev.Field');
    });

    it('if meta.name is passed, it must match the model name', () => {
        expect(() => {
            TestModel.meta = {
                name: 'Flibble',
                fields: []
            };
            initialiseMeta(TestModel);
        }).to.throw('Model name does not match meta.name');
        expect(() => {
            TestModel.meta = {
                name: 'TestModel',
                fields: []
            };
            initialiseMeta(TestModel);
        }).to.not.throw();
    });

    it('throws an error if a field name is defined twice', () => {
        expect(() => {
            TestModel.meta = {
                fields: [
                    new TextField('flibble'),
                    new TextField('wibble'),
                    new IntegerField('flibble')
                ]
            };
            initialiseMeta(TestModel);
        }).to.throw('Field "flibble" is defined more than once');
    });

    it('creates the fieldsByName property as expected', () => {
        initialiseMeta(TestModel);
        let fieldNames = TestModel.meta.fields.map((f) => f.name);
        expect(Object.keys(TestModel.meta.fieldsByName)).to.deep.equal(fieldNames);
        expect(TestModel.meta.fieldsByName[fieldNames[0]]).to.be.instanceOf(Field);
    });

    it('should set up meta.backend ("default" if not defined)', () => {
        TestModel.meta.backend = undefined;
        TestModel2.meta.backend = 'main_db';
        initialiseMeta(TestModel);
        initialiseMeta(TestModel2);
        expect(TestModel.meta.backend).to.equal('default');
        expect(TestModel2.meta.backend).to.equal('main_db');
    });

    it('should set up meta.label (if not set, should equal model name)', () => {
        TestModel.meta.label = undefined;
        TestModel2.meta.label = 'Awesome Entity';
        initialiseMeta(TestModel);
        initialiseMeta(TestModel2);
        expect(TestModel.meta.label).to.equal('TestModel');
        expect(TestModel2.meta.label).to.equal('Awesome Entity');
    });

    it('should set up meta.singleton (defaults to false)', () => {
        TestModel.meta.singleton = undefined;
        TestModel2.meta.singleton = true;
        initialiseMeta(TestModel);
        initialiseMeta(TestModel2);
        expect(TestModel.meta.singleton).to.equal(false);
        expect(TestModel2.meta.singleton).to.equal(true);
    });

});

describe('initialiseMeta() - with decorators', () => {

    it('creates metadata as expected when only decorators are used', () => {
        class MyClass extends Model {
            @d.IntegerField()
                id: number;
            @d.TextField()
                name: string;
            @d.BooleanField()
                active: boolean;
        }
        initialiseMeta(MyClass);
        expect(MyClass.meta.fields).to.have.length(3);
        expect(MyClass.meta.fieldsByName).to.have.keys('id', 'name', 'active');
    });

    it('decorator metadata is added to empty metadata', () => {
        class MyClass extends Model {
            @d.IntegerField()
                id: number;
            @d.TextField()
                name: string;
            @d.BooleanField()
                active: boolean;
        }
        MyClass.meta = {};
        initialiseMeta(MyClass);
        expect(MyClass.meta.fields).to.have.length(3);
        expect(MyClass.meta.fieldsByName).to.have.keys('id', 'name', 'active');
    });

    it('decorator metadata is added to existing metadata', () => {
        class MyClass extends Model {
            @d.IntegerField()
                id: number;
            @d.TextField()
                name: string;
            @d.BooleanField()
                active: boolean;
        }
        MyClass.meta = {
            fields: [
                new TextField('flibble')
            ]
        };
        initialiseMeta(MyClass);
        expect(MyClass.meta.fields).to.have.length(4);
        expect(MyClass.meta.fieldsByName).to.have.keys('flibble', 'id', 'name', 'active');
    });

    it('removes the __fields property once it has been transferred to metadata', () => {
        class MyClass extends Model {
            @d.TextField()
                name: string;
        }
        expect((MyClass.prototype as any).__fields).to.be.an('Array');
        initialiseMeta(MyClass);
        expect((MyClass.prototype as any).__fields).to.be.undefined;
    });

    it('throws an error if for some reason prototype.__fields is not an array', () => {
        class MyClass extends Model {}
        (MyClass.prototype as any).__fields = 'flibble';
        expect(() => {
            initialiseMeta(MyClass);
        }).to.throw('Model __fields property must be an array');
    });

    it('throws an error if meta.fields is not an array', () => {
        class MyClass extends Model {
            @d.TextField()
                name: string;
        }
        MyClass.meta = {
            fields: {}
        } as any;
        expect(() => {
            initialiseMeta(MyClass);
        }).to.throw('fields entry must be an array');
    });

});
