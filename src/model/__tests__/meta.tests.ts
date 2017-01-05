import { Field } from '../../fields/index';
import { IModelMeta, initialiseMeta } from '../meta';
import { expect } from 'chai';
import { IntegerField, TextField, DateField } from '../../fields';

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

describe('initialiseMeta()', () => {

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
