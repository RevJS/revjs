"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../models/utils");
var InMemoryStorage = (function () {
    function InMemoryStorage() {
        this.storage = {};
        this.storage = {};
    }
    InMemoryStorage.prototype.load = function (data, meta, result, options) {
        var _this = this;
        return new Promise(function () {
            utils_1.checkMetadataInitialised(meta);
            if (meta.singleton) {
                throw new Error('InMemoryStorage.load() cannot be used with a singleton model');
            }
            if (typeof data != 'object' || !(data instanceof Array)
                || (data.length > 0 && typeof data[0] != 'object')) {
                throw new Error('InMemoryStorage.load() data must be an array of objects');
            }
            _this.storage[meta.name] = data;
        });
    };
    InMemoryStorage.prototype.create = function (model, meta, result, options) {
        var _this = this;
        return new Promise(function (resolve) {
            utils_1.checkIsModelInstance(model);
            utils_1.checkMetadataInitialised(meta);
            if (meta.singleton) {
                throw new Error('InMemoryStorage.create() cannot be called on singleton models');
            }
            var modelData = _this.getModelData(model.constructor, meta);
            var record = {};
            _this.writeFields(model, meta, record);
            modelData.push(record);
        });
    };
    InMemoryStorage.prototype.update = function (model, meta, where, result, options) {
        var _this = this;
        return new Promise(function (resolve) {
            if (!meta.singleton && !where) {
                throw new Error('InMemoryStorage.update() requires the \'where\' parameter for non-singleton models');
            }
            var modelData = _this.getModelData(model.constructor, meta);
            if (meta.singleton) {
                _this.writeFields(model, meta, modelData);
                resolve();
            }
            else {
                throw new Error('InMemoryStorage.update() not yet implemented for non-singleton models');
            }
        });
    };
    InMemoryStorage.prototype.read = function (model, meta, where, result, options) {
        var _this = this;
        return new Promise(function (resolve) {
            if (!meta.singleton && !where) {
                throw new Error('InMemoryStorage.read() requires the \'where\' parameter for non-singleton models');
            }
            var modelData = _this.getModelData(model, meta);
            if (meta.singleton) {
                result.result = modelData;
                resolve();
            }
            else {
                // TODO: Implement filtering
                result.results = modelData;
                resolve();
            }
        });
    };
    InMemoryStorage.prototype.remove = function (meta, where, result, options) {
        throw new Error('InMemoryStorage.delete() not yet implemented');
    };
    InMemoryStorage.prototype.getModelData = function (model, meta) {
        if (!this.storage[meta.name]) {
            if (meta.singleton) {
                this.storage[meta.name] = new model();
            }
            else {
                this.storage[meta.name] = [];
            }
        }
        return this.storage[meta.name];
    };
    InMemoryStorage.prototype.writeFields = function (model, meta, target) {
        for (var _i = 0, _a = meta.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            target[field.name] = model[field.name];
        }
    };
    return InMemoryStorage;
}());
exports.InMemoryStorage = InMemoryStorage;
