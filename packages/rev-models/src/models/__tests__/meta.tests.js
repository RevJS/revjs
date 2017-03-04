"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../fields/index");
var meta_1 = require("../meta");
var chai_1 = require("chai");
var fields_1 = require("../../fields");
var d = require("../../decorators");
var TestModel = (function () {
    function TestModel() {
        this.id = 1;
        this.name = 'A Test Model';
        this.date = new Date();
    }
    return TestModel;
}());
var TestModel2 = (function () {
    function TestModel2() {
    }
    return TestModel2;
}());
var testMeta;
var testMeta2;
function getAnyObject() {
    return Object.assign({});
}
describe('initialiseMeta() - metadata only', function () {
    beforeEach(function () {
        testMeta = {
            fields: [
                new fields_1.IntegerField('id', 'Id'),
                new fields_1.TextField('name', 'Name'),
                new fields_1.DateField('date', 'Date')
            ]
        };
        testMeta2 = { fields: [] };
    });
    it('throws an error if fields metadata is missing', function () {
        chai_1.expect(function () {
            meta_1.initialiseMeta(TestModel, null);
        }).to.throw('You must define the fields metadata for the model');
        chai_1.expect(function () {
            meta_1.initialiseMeta(TestModel, {});
        }).to.throw('You must define the fields metadata for the model');
    });
    it('throws an error if fields array contains invalid items', function () {
        chai_1.expect(function () {
            meta_1.initialiseMeta(TestModel, {
                fields: [
                    new fields_1.TextField('flibble', 'Jibble'),
                    getAnyObject()
                ]
            });
        }).to.throw('is not an instance of rev.Field');
    });
    it('if meta.name is passed, it must match the model name', function () {
        chai_1.expect(function () {
            meta_1.initialiseMeta(TestModel, {
                name: 'Flibble',
                fields: []
            });
        }).to.throw('Model name does not match meta.name');
        chai_1.expect(function () {
            meta_1.initialiseMeta(TestModel, {
                name: 'TestModel',
                fields: []
            });
        }).to.not.throw();
    });
    it('throws an error if a field name is defined twice', function () {
        chai_1.expect(function () {
            meta_1.initialiseMeta(TestModel, {
                fields: [
                    new fields_1.TextField('flibble', 'Jibble'),
                    new fields_1.TextField('wibble', 'Some Field'),
                    new fields_1.IntegerField('flibble', 'The Duplicate')
                ]
            });
        }).to.throw('Field "flibble" is defined more than once');
    });
    it('creates the fieldsByName property as expected', function () {
        meta_1.initialiseMeta(TestModel, testMeta);
        var fieldNames = testMeta.fields.map(function (f) { return f.name; });
        chai_1.expect(Object.keys(testMeta.fieldsByName)).to.deep.equal(fieldNames);
        chai_1.expect(testMeta.fieldsByName[fieldNames[0]]).to.be.instanceOf(index_1.Field);
    });
    it('should set up meta.storage ("default" if not defined)', function () {
        testMeta.storage = undefined;
        testMeta2.storage = 'main_db';
        meta_1.initialiseMeta(TestModel, testMeta);
        meta_1.initialiseMeta(TestModel2, testMeta2);
        chai_1.expect(testMeta.storage).to.equal('default');
        chai_1.expect(testMeta2.storage).to.equal('main_db');
    });
    it('should set up meta.label (if not set, should equal model name)', function () {
        testMeta.label = undefined;
        testMeta2.label = 'Awesome Entity';
        meta_1.initialiseMeta(TestModel, testMeta);
        meta_1.initialiseMeta(TestModel2, testMeta2);
        chai_1.expect(testMeta.label).to.equal('TestModel');
        chai_1.expect(testMeta2.label).to.equal('Awesome Entity');
    });
    it('should set up meta.singleton (defaults to false)', function () {
        testMeta.singleton = undefined;
        testMeta2.singleton = true;
        meta_1.initialiseMeta(TestModel, testMeta);
        meta_1.initialiseMeta(TestModel2, testMeta2);
        chai_1.expect(testMeta.singleton).to.equal(false);
        chai_1.expect(testMeta2.singleton).to.equal(true);
    });
});
describe('initialiseMeta() - with decorators', function () {
    it('creates metadata as expected when only decorators are used', function () {
        var MyClass = (function () {
            function MyClass() {
            }
            return MyClass;
        }());
        __decorate([
            d.IntegerField('ID')
        ], MyClass.prototype, "id", void 0);
        __decorate([
            d.TextField('Name')
        ], MyClass.prototype, "name", void 0);
        __decorate([
            d.BooleanField('Active?')
        ], MyClass.prototype, "active", void 0);
        var meta = meta_1.initialiseMeta(MyClass);
        chai_1.expect(meta.fields).to.have.length(3);
        chai_1.expect(meta.fieldsByName).to.have.keys('id', 'name', 'active');
    });
    it('decorator metadata is added to empty metadata', function () {
        var MyClass = (function () {
            function MyClass() {
            }
            return MyClass;
        }());
        __decorate([
            d.IntegerField('ID')
        ], MyClass.prototype, "id", void 0);
        __decorate([
            d.TextField('Name')
        ], MyClass.prototype, "name", void 0);
        __decorate([
            d.BooleanField('Active?')
        ], MyClass.prototype, "active", void 0);
        var meta = meta_1.initialiseMeta(MyClass, {});
        chai_1.expect(meta.fields).to.have.length(3);
        chai_1.expect(meta.fieldsByName).to.have.keys('id', 'name', 'active');
    });
    it('decorator metadata is added to existing metadata', function () {
        var MyClass = (function () {
            function MyClass() {
            }
            return MyClass;
        }());
        __decorate([
            d.IntegerField('ID')
        ], MyClass.prototype, "id", void 0);
        __decorate([
            d.TextField('Name')
        ], MyClass.prototype, "name", void 0);
        __decorate([
            d.BooleanField('Active?')
        ], MyClass.prototype, "active", void 0);
        var baseMeta = {
            fields: [
                new fields_1.TextField('flibble', 'Flibble')
            ]
        };
        var meta = meta_1.initialiseMeta(MyClass, baseMeta);
        chai_1.expect(meta.fields).to.have.length(4);
        chai_1.expect(meta.fieldsByName).to.have.keys('flibble', 'id', 'name', 'active');
    });
    it('removes the __fields property once it has been transferred to metadata', function () {
        var MyClass = (function () {
            function MyClass() {
            }
            return MyClass;
        }());
        __decorate([
            d.TextField('Name')
        ], MyClass.prototype, "name", void 0);
        chai_1.expect(MyClass.prototype.__fields).to.be.an('Array');
        meta_1.initialiseMeta(MyClass);
        chai_1.expect(MyClass.prototype.__fields).to.be.undefined;
    });
    it('throws an error if for some reason prototype.__fields is not an array', function () {
        var MyClass = (function () {
            function MyClass() {
            }
            return MyClass;
        }());
        MyClass.prototype.__fields = 'flibble';
        chai_1.expect(function () {
            meta_1.initialiseMeta(MyClass);
        }).to.throw('Model __fields property must be an array');
    });
    it('throws an error if meta.fields is not an array', function () {
        var MyClass = (function () {
            function MyClass() {
            }
            return MyClass;
        }());
        __decorate([
            d.TextField('Name')
        ], MyClass.prototype, "name", void 0);
        var meta = {
            fields: {}
        };
        chai_1.expect(function () {
            meta_1.initialiseMeta(MyClass, meta);
        }).to.throw('fields entry must be an array');
    });
});
