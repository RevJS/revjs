"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var inmemory_1 = require("../inmemory");
var meta_1 = require("../../models/meta");
var fld = require("../../fields");
var operations_1 = require("../../models/operations");
describe('rev.storage.inmemory', function () {
    var TestModel = (function () {
        function TestModel() {
        }
        TestModel.prototype.getDescription = function () {
            return this.name + ", age " + this.age;
        };
        return TestModel;
    }());
    var testData = [
        {
            name: 'Joe Bloggs',
            age: 20,
            gender: 'male',
            newsletter: true,
            date_registered: new Date('2016-05-26')
        },
        {
            name: 'Jane Doe',
            age: 23,
            gender: 'female',
            newsletter: true,
            date_registered: new Date('2017-01-01')
        },
        {
            name: 'Felix The Cat',
            age: 3,
            gender: 'male',
            newsletter: false,
            date_registered: new Date('2016-12-03')
        }
    ];
    var GENDERS = [
        ['male', 'Male'],
        ['female', 'Female']
    ];
    var meta;
    var storage;
    var loadResult;
    var readResult;
    beforeEach(function () {
        meta = {
            fields: [
                new fld.TextField('name', 'Name'),
                new fld.IntegerField('age', 'Age', { required: false }),
                new fld.SelectionField('gender', 'Gender', GENDERS),
                new fld.BooleanField('newsletter', 'Newsletter?'),
                new fld.DateField('date_registered', 'Date Registered')
            ]
        };
        meta_1.initialiseMeta(TestModel, meta);
        storage = new inmemory_1.InMemoryStorage();
        loadResult = new operations_1.ModelOperationResult({ type: 'create' });
        readResult = new operations_1.ModelOperationResult({ type: 'read' });
    });
    describe('initial state - singleton model', function () {
        it('read() returns a model instance result with all undefined values', function () {
            meta.singleton = true;
            return storage.read(TestModel, meta, null, readResult)
                .then(function () {
                chai_1.expect(readResult.result).to.be.instanceOf(TestModel);
                chai_1.expect(readResult.results).to.be.null;
                chai_1.expect(readResult.result.getDescription).to.be.a('function');
                for (var _i = 0, _a = meta.fields; _i < _a.length; _i++) {
                    var field = _a[_i];
                    chai_1.expect(readResult.result[field.name]).to.be.undefined;
                }
            });
        });
    });
    describe('initial state - non-singleton model', function () {
        it('read() returns an empty list', function () {
            return storage.read(TestModel, meta, {}, readResult)
                .then(function () {
                chai_1.expect(readResult.result).to.be.null;
                chai_1.expect(readResult.results).to.be.instanceOf(Array);
                chai_1.expect(readResult.results.length).to.equal(0);
            });
        });
    });
    describe('read()', function () {
        // TODO TEST LIMIT
        it('returns all records when where clause = {}', function () {
            storage.load(testData, meta, loadResult);
            return storage.read(TestModel, meta, {}, readResult)
                .then(function () {
                chai_1.expect(readResult.result).to.be.null;
                chai_1.expect(readResult.results).to.deep.equal(testData);
            });
        });
    });
});
