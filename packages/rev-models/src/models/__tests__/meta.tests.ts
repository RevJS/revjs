import { Field } from '../../fields/index';
import { initialiseMeta, checkMetadataInitialised, IModelMeta } from '../meta';
import { expect } from 'chai';
import { IntegerField, TextField, DateField } from '../../fields';
import * as d from '../../decorators';
import { Model } from '../model';
import { ModelRegistry } from '../../registry/registry';

class TestModel extends Model {
    id: number = 1;
    name: string = 'A Test Model';
    date: Date = new Date();
}

class TestModel2 extends Model {}

function getAnyObject() {
    return Object.assign({});
}

let testRegistry: ModelRegistry;
let testModelMeta: IModelMeta<TestModel>;
let testModelMetaRes: IModelMeta<TestModel>;
let testModel2Meta: IModelMeta<TestModel2>;
let testModel2MetaRes: IModelMeta<TestModel2>;

describe('initialiseMeta()', () => {

    beforeEach(() => {
        testRegistry = {
            isBackendRegistered: () => true
        } as any;
        testModelMeta = {
            fields: [
                new IntegerField('id'),
                new TextField('name'),
                new DateField('date')
            ]
        };
        testModel2Meta = { fields: [] };
    });

    it('throws an error if fields metadata is missing', () => {
        expect(() => {
            testModelMeta = null;
            initialiseMeta(testRegistry, TestModel, testModelMeta);
        }).to.throw('You must define the fields metadata for the model');
        expect(() => {
            testModelMeta = {};
            initialiseMeta(testRegistry, TestModel, testModelMeta);
        }).to.throw('You must define the fields metadata for the model');
    });

    it('throws an error if fields array contains invalid items', () => {
        expect(() => {
            testModelMeta = {
                fields: [
                    new TextField('flibble'),
                    getAnyObject() as IntegerField
                ]
            };
            initialiseMeta(testRegistry, TestModel, testModelMeta);
        }).to.throw('is not an instance of rev.Field');
    });

    it('if meta.name is passed, it must match the model name', () => {
        expect(() => {
            testModelMeta = {
                name: 'Flibble',
                fields: []
            };
            initialiseMeta(testRegistry, TestModel, testModelMeta);
        }).to.throw('Model name does not match meta.name');
        expect(() => {
            testModelMeta = {
                name: 'TestModel',
                fields: []
            };
            initialiseMeta(testRegistry, TestModel, testModelMeta);
        }).to.not.throw();
    });

    it('should set up meta.backend ("default" if not defined)', () => {
        testModelMeta.backend = undefined;
        testModelMetaRes = initialiseMeta(testRegistry, TestModel, testModelMeta);
        testModel2Meta.backend = 'main_db';
        testModel2MetaRes = initialiseMeta(testRegistry, TestModel2, testModel2Meta);
        expect(testModelMetaRes.backend).to.equal('default');
        expect(testModel2MetaRes.backend).to.equal('main_db');
    });

    it('should set up meta.label (if not set, should equal model name)', () => {
        testModelMeta.label = undefined;
        testModelMetaRes = initialiseMeta(testRegistry, TestModel, testModelMeta);
        testModel2Meta.label = 'Awesome Entity';
        testModel2MetaRes = initialiseMeta(testRegistry, TestModel2, testModel2Meta);
        expect(testModelMetaRes.label).to.equal('TestModel');
        expect(testModel2MetaRes.label).to.equal('Awesome Entity');
    });

    it('assigns meta.ctor to the class constructor', () => {
        testModelMetaRes = initialiseMeta(testRegistry, TestModel, testModelMeta);
        expect(testModelMetaRes.ctor).to.equal(TestModel);
    });

    it('throws an error if the specified backend is not registered', () => {
        testRegistry.isBackendRegistered = () => false;
        expect(() => {
            initialiseMeta(testRegistry, TestModel, testModelMeta);
        }).to.throw('Backend "default" is not registered');
    });

    it('throws an error if a field name is defined twice', () => {
        expect(() => {
            testModelMeta = {
                fields: [
                    new TextField('flibble'),
                    new TextField('wibble'),
                    new IntegerField('flibble')
                ]
            };
            initialiseMeta(testRegistry, TestModel, testModelMeta);
        }).to.throw('Field "flibble" is defined more than once');
    });

    it('creates the fieldsByName property as expected', () => {
        testModelMetaRes = initialiseMeta(testRegistry, TestModel, testModelMeta);
        let fieldNames = testModelMeta.fields.map((f) => f.name);
        expect(Object.keys(testModelMetaRes.fieldsByName)).to.deep.equal(fieldNames);
        expect(testModelMetaRes.fieldsByName[fieldNames[0]]).to.be.instanceOf(Field);
    });

});

describe('initialiseMeta() - with decorators', () => {

    beforeEach(() => {
        testRegistry = {
            isBackendRegistered: () => true
        } as any;
    });

    it('creates metadata as expected when only decorators are used', () => {
        class MyClass extends Model {
            @d.IntegerField()
                id: number;
            @d.TextField()
                name: string;
            @d.BooleanField()
                active: boolean;
        }
        let res = initialiseMeta(testRegistry, MyClass);
        expect(res.fields).to.have.length(3);
        expect(res.fieldsByName).to.have.keys('id', 'name', 'active');
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
        let res = initialiseMeta(testRegistry, MyClass, {});
        expect(res.fields).to.have.length(3);
        expect(res.fieldsByName).to.have.keys('id', 'name', 'active');
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
        let myClassMeta = {
            fields: [
                new TextField('flibble')
            ]
        };
        let res = initialiseMeta(testRegistry, MyClass, myClassMeta);
        expect(res.fields).to.have.length(4);
        expect(res.fieldsByName).to.have.keys('flibble', 'id', 'name', 'active');
    });

    it('does not removes the __fields property', () => {
        class MyClass extends Model {
            @d.TextField()
                name: string;
        }
        expect((MyClass.prototype as any).__fields).to.be.an('Array');
        initialiseMeta(testRegistry, MyClass);
        expect((MyClass.prototype as any).__fields).to.be.an('Array');
    });

    it('meta.primaryKey defaults to []', () => {
        class MyClass extends Model {
            @d.IntegerField()
                id: number;
            @d.TextField()
                name: string;
        }
        let res = initialiseMeta(testRegistry, MyClass);
        expect(res.primaryKey).to.deep.equal([]);
    });

    it('fields with primaryKey set are added to meta.primaryKey', () => {
        class MyClass extends Model {
            @d.IntegerField({primaryKey: true})
                id: number;
            @d.TextField({primaryKey: true})
                name: string;
        }
        let res = initialiseMeta(testRegistry, MyClass);
        expect(res.primaryKey).to.deep.equal(['id', 'name']);
    });

    it('fields with primaryKey set are merged with existing meta.primaryKey', () => {
        class MyClass extends Model {
            @d.IntegerField({primaryKey: true})
                id: number;
            @d.TextField()
                name: string;
        }
        let meta = {
            primaryKey: ['name']
        };
        let res = initialiseMeta(testRegistry, MyClass, meta);
        expect(res.primaryKey).to.deep.equal(['name', 'id']);
    });

    it('meta.primaryKey is left untouched if fields do not override it', () => {
        class MyClass extends Model {
            @d.IntegerField()
                id: number;
            @d.TextField()
                name: string;
        }
        let meta = {
            primaryKey: ['id', 'name']
        };
        let res = initialiseMeta(testRegistry, MyClass, meta);
        expect(res.primaryKey).to.deep.equal(['id', 'name']);
    });

    it('throws if an invalid field name is in meta.primaryKey', () => {
        class MyClass extends Model {
            @d.IntegerField()
                id: number;
            @d.TextField()
                name: string;
        }
        let meta = {
            primaryKey: ['id', 'woooo']
        };
        expect(() => {
            initialiseMeta(testRegistry, MyClass, meta);
        }).to.throw('Primary key field "woooo" is not defined');
    });

    it('throws an error if for some reason prototype.__fields is not an array', () => {
        class MyClass extends Model {}
        (MyClass.prototype as any).__fields = 'flibble';
        expect(() => {
            initialiseMeta(testRegistry, MyClass);
        }).to.throw('Model __fields property must be an array');
    });

    it('throws an error if meta.fields is not an array', () => {
        class MyClass extends Model {
            @d.TextField()
                name: string;
        }
        let meta = {
            fields: {}
        } as any;
        expect(() => {
            initialiseMeta(testRegistry, MyClass, meta);
        }).to.throw('fields entry must be an array');
    });

});

describe('checkMetadataInitialised()', () => {

    let notInitedMsg = 'MetadataError: Model metadata has not been initialised.';

    beforeEach(() => {
        testModelMeta = {
            fields: [
                new IntegerField('id'),
                new TextField('name'),
                new DateField('date')
            ]
        };
    });

    it('should not throw if model has initialised metadata', () => {
        expect(() => {
            let res = initialiseMeta(testRegistry, TestModel, testModelMeta);
            checkMetadataInitialised(res);
        }).to.not.throw();
    });

    it('should throw if model metadata is a non-object', () => {
        let nonObjects = [undefined, null, 22, 'string'];
        for (let obj of nonObjects) {
            expect(() => {
                testModelMeta = obj;
                checkMetadataInitialised(TestModel);
            }).to.throw(notInitedMsg);
        }
    });

    it('should throw if meta.fields is not set or is not an array', () => {
        let nonArrays = [undefined, null, {}, 22, 'string'];
        for (let obj of nonArrays) {
            expect(() => {
                testModelMeta = { fields: obj } as any;
                checkMetadataInitialised(TestModel);
            }).to.throw(notInitedMsg);
        }
    });

    it('should throw if meta.fieldsByName is not set or is not an object', () => {
        expect(() => {
            testModelMeta = {
                fields: []
            };
            checkMetadataInitialised(TestModel);
        }).to.throw(notInitedMsg);
        expect(() => {
            testModelMeta = {
                fields: [],
                fieldsByName: null
            };
            checkMetadataInitialised(TestModel);
        }).to.throw(notInitedMsg);
        expect(() => {
            testModelMeta = {
                fields: [],
                fieldsByName: 22 as any
            };
            checkMetadataInitialised(TestModel);
        }).to.throw(notInitedMsg);
    });

});
