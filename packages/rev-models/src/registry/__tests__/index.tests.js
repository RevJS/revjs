"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var fields_1 = require("../../fields");
var registry = require("../index");
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
describe('ModelRegistry', function () {
    var testReg;
    beforeEach(function () {
        testReg = new registry.ModelRegistry();
        testMeta = {
            fields: [
                new fields_1.IntegerField('id', 'Id'),
                new fields_1.TextField('name', 'Name'),
                new fields_1.DateField('date', 'Date')
            ]
        };
        testMeta2 = { fields: [] };
    });
    describe('constructor()', function () {
        it('creates a registry with no models', function () {
            chai_1.expect(testReg.getModelNames()).to.have.length(0);
        });
    });
    describe('isRegistered()', function () {
        it('returns false when a model is not registered', function () {
            chai_1.expect(testReg.isRegistered('TestModel')).to.equal(false);
        });
        it('returns true when a model is registered', function () {
            testReg.register(TestModel, testMeta);
            chai_1.expect(testReg.isRegistered('TestModel')).to.equal(true);
        });
        it('returns false when a non-string is passed', function () {
            chai_1.expect(testReg.isRegistered(22)).to.equal(false);
        });
        it('returns false when an object is passed', function () {
            chai_1.expect(testReg.isRegistered({ test: 1 })).to.equal(false);
        });
    });
    describe('register()', function () {
        it('adds a valid model and metadata to the registry', function () {
            testReg.register(TestModel, testMeta);
            chai_1.expect(testReg.getProto('TestModel')).to.equal(TestModel);
            chai_1.expect(testReg.getMeta('TestModel')).to.equal(testMeta);
        });
        it('adds a decorated model to the registry. No need to pass metadata.', function () {
            var DecoratedModel = (function () {
                function DecoratedModel() {
                }
                return DecoratedModel;
            }());
            __decorate([
                d.TextField('Name')
            ], DecoratedModel.prototype, "name", void 0);
            __decorate([
                d.IntegerField('Age')
            ], DecoratedModel.prototype, "age", void 0);
            testReg.register(DecoratedModel);
            chai_1.expect(testReg.getProto('DecoratedModel')).to.equal(DecoratedModel);
            chai_1.expect(testReg.getMeta('DecoratedModel').fieldsByName).to.have.keys('name', 'age');
        });
        it('rejects a non-model constructor with a ModelError', function () {
            chai_1.expect(function () {
                testReg.register({}, testMeta);
            }).to.throw('ModelError');
        });
        it('throws an error if model already exists', function () {
            testReg.register(TestModel, testMeta);
            chai_1.expect(function () {
                testReg.register(TestModel, testMeta);
            }).to.throw('already exists in the registry');
        });
        it('should initialise metadata', function () {
            testReg.register(TestModel, testMeta);
            chai_1.expect(testMeta.fieldsByName).to.be.an('object');
        });
        it('throws an error if metadata cannot be initialised', function () {
            chai_1.expect(function () {
                testReg.register(TestModel);
            }).to.throw('MetadataError');
        });
    });
    describe('getModelNames()', function () {
        it('should get the names of the models', function () {
            chai_1.expect(testReg.getModelNames()).to.deep.equal([]);
            testReg.register(TestModel, testMeta);
            chai_1.expect(testReg.getModelNames()).to.deep.equal(['TestModel']);
            testReg.register(TestModel2, testMeta2);
            chai_1.expect(testReg.getModelNames()).to.deep.equal(['TestModel', 'TestModel2']);
        });
    });
    describe('getProto()', function () {
        it('should return model prototype', function () {
            testReg.register(TestModel, testMeta);
            chai_1.expect(testReg.getProto('TestModel')).to.equal(TestModel);
        });
        it('should throw an error if the model does not exist', function () {
            chai_1.expect(function () {
                testReg.getProto('Flibble');
            }).to.throw('does not exist in the registry');
            testReg.register(TestModel, testMeta);
            chai_1.expect(function () {
                testReg.getProto('Jibble');
            }).to.throw('does not exist in the registry');
        });
    });
    describe('getMeta()', function () {
        it('should return model metadata', function () {
            testReg.register(TestModel, testMeta);
            chai_1.expect(testReg.getMeta('TestModel')).to.equal(testMeta);
        });
        it('should throw an error if the model does not exist', function () {
            chai_1.expect(function () {
                testReg.getMeta('Flibble');
            }).to.throw('does not exist in the registry');
            testReg.register(TestModel, testMeta);
            chai_1.expect(function () {
                testReg.getMeta('Jibble');
            }).to.throw('does not exist in the registry');
        });
    });
    describe('rev.registry', function () {
        it('should be an instance of ModelRegistry', function () {
            chai_1.expect(registry.registry)
                .to.be.an.instanceOf(registry.ModelRegistry);
        });
    });
    describe('rev.register()', function () {
        it('should add models to the shared registry', function () {
            registry.registry.register(TestModel, testMeta);
            chai_1.expect(registry.registry.getMeta('TestModel')).to.equal(testMeta);
        });
        it('should throw an error if something goes wrong', function () {
            chai_1.expect(function () {
                registry.registry.register(TestModel, testMeta);
            }).to.throw('already exists in the registry');
        });
    });
});
