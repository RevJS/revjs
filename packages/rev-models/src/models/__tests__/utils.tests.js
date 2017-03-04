"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var utils_1 = require("../utils");
describe('rev.model', function () {
    describe('checkIsModelInstance()', function () {
        var errorMessage = 'ModelError: Supplied model is not a model instance.';
        it('should not throw if object is passed', function () {
            chai_1.expect(function () {
                utils_1.checkIsModelInstance({ name: 'Fred' });
            }).to.not.throw();
        });
        it('should throw if a non-object is passed', function () {
            chai_1.expect(function () {
                utils_1.checkIsModelInstance(undefined);
            }).to.throw(errorMessage);
            chai_1.expect(function () {
                utils_1.checkIsModelInstance(null);
            }).to.throw(errorMessage);
            chai_1.expect(function () {
                utils_1.checkIsModelInstance(22);
            }).to.throw(errorMessage);
            chai_1.expect(function () {
                utils_1.checkIsModelInstance('string');
            }).to.throw(errorMessage);
            chai_1.expect(function () {
                utils_1.checkIsModelInstance(function () { });
            }).to.throw(errorMessage);
        });
    });
    describe('checkIsModelConstructor()', function () {
        var errorMessage = 'ModelError: Supplied model is not a model constructor.';
        it('should not throw if a constructor is passed', function () {
            chai_1.expect(function () {
                utils_1.checkIsModelConstructor(function MyModel() { });
            }).to.not.throw();
        });
        it('should throw if a non-constructor is passed', function () {
            chai_1.expect(function () {
                utils_1.checkIsModelConstructor(undefined);
            }).to.throw(errorMessage);
            chai_1.expect(function () {
                utils_1.checkIsModelConstructor(null);
            }).to.throw(errorMessage);
            chai_1.expect(function () {
                utils_1.checkIsModelConstructor(22);
            }).to.throw(errorMessage);
            chai_1.expect(function () {
                utils_1.checkIsModelConstructor('string');
            }).to.throw(errorMessage);
            chai_1.expect(function () {
                utils_1.checkIsModelConstructor(function () { });
            }).to.throw(errorMessage);
            chai_1.expect(function () {
                utils_1.checkIsModelConstructor({ name: 'Fred' });
            }).to.throw(errorMessage);
        });
    });
    describe('checkMetadataInitialised()', function () {
        var nonObjMsg = 'MetadataError: Supplied metadata is not an object.';
        var fieldsMissingMsg = 'MetadataError: Supplied metadata does not contain fields array.';
        var notInitedMsg = 'MetadataError: Supplied metadata has not been initialised.';
        it('should not throw if initialised metadata is passed', function () {
            chai_1.expect(function () {
                utils_1.checkMetadataInitialised({
                    fields: [],
                    fieldsByName: {}
                });
            }).to.not.throw();
        });
        it('should throw if a non-object is passed', function () {
            chai_1.expect(function () {
                utils_1.checkMetadataInitialised(undefined);
            }).to.throw(nonObjMsg);
            chai_1.expect(function () {
                utils_1.checkMetadataInitialised(null);
            }).to.throw(nonObjMsg);
            chai_1.expect(function () {
                utils_1.checkMetadataInitialised(22);
            }).to.throw(nonObjMsg);
            chai_1.expect(function () {
                utils_1.checkMetadataInitialised('string');
            }).to.throw(nonObjMsg);
        });
        it('should throw if meta.fields is not set or is not an array', function () {
            chai_1.expect(function () {
                utils_1.checkMetadataInitialised({});
            }).to.throw(fieldsMissingMsg);
            chai_1.expect(function () {
                utils_1.checkMetadataInitialised({
                    fields: null
                });
            }).to.throw(fieldsMissingMsg);
            chai_1.expect(function () {
                utils_1.checkMetadataInitialised({
                    fields: 22
                });
            }).to.throw(fieldsMissingMsg);
            chai_1.expect(function () {
                utils_1.checkMetadataInitialised({
                    fields: {}
                });
            }).to.throw(fieldsMissingMsg);
        });
        it('should throw if meta.fieldsByName is not set or is not an object', function () {
            chai_1.expect(function () {
                utils_1.checkMetadataInitialised({
                    fields: []
                });
            }).to.throw(notInitedMsg);
            chai_1.expect(function () {
                utils_1.checkMetadataInitialised({
                    fields: [],
                    fieldsByName: null
                });
            }).to.throw(notInitedMsg);
            chai_1.expect(function () {
                utils_1.checkMetadataInitialised({
                    fields: [],
                    fieldsByName: 22
                });
            }).to.throw(notInitedMsg);
        });
    });
});
