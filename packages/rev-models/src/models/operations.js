"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var validation_1 = require("./validation");
var registry_1 = require("../registry");
var operationmsg_1 = require("./operationmsg");
var storage = require("../storage");
var ModelOperationResult = (function () {
    function ModelOperationResult(operation) {
        this.operation = operation;
        this.success = true;
        this.errors = [];
        this.validation = null;
        this.result = null;
        this.results = null;
    }
    ModelOperationResult.prototype.addError = function (message, code, data) {
        if (!message) {
            throw new Error("ModelOperationResult Error: A message must be specified for the operation error.");
        }
        this.success = false;
        var operationError = {
            message: message
        };
        if (code) {
            operationError.code = code;
        }
        if (data) {
            if (typeof data != 'object') {
                throw new Error("ModelOperationResult Error: You cannot add non-object data to an operation result.");
            }
            Object.assign(operationError, data);
        }
        this.errors.push(operationError);
    };
    return ModelOperationResult;
}());
exports.ModelOperationResult = ModelOperationResult;
// TODO: Implement a 'load' method that takes a JSON array of data
function create(model, options) {
    return new Promise(function (resolve, reject) {
        utils_1.checkIsModelInstance(model);
        var meta = registry_1.registry.getMeta(model.constructor.name);
        var store = storage.get(meta.storage);
        if (meta.singleton) {
            throw new Error('create() cannot be called on singleton models');
        }
        var operation = {
            type: 'create'
        };
        var operationResult = new ModelOperationResult(operation);
        validation_1.validateModel(model, meta, operation, options ? options.validation : null)
            .then(function (validationResult) {
            operationResult.validation = validationResult;
            if (validationResult.valid) {
                store.create(model, meta, operationResult, options)
                    .then(function () {
                    resolve(operationResult);
                })
                    .catch(function (err) {
                    reject(err);
                });
            }
            else {
                operationResult.addError(operationmsg_1.OPERATION_MESSAGES.failed_validation(meta.name), 'failed_validation');
                resolve(operationResult);
            }
        })
            .catch(function (err) {
            reject(err);
        });
    });
}
exports.create = create;
function update(model, where, options) {
    return new Promise(function (resolve, reject) {
        utils_1.checkIsModelInstance(model);
        // TODO: Validate 'where' parameter
        var meta = registry_1.registry.getMeta(model.constructor.name);
        var store = storage.get(meta.storage);
        if (!meta.singleton && (!where || typeof where != 'object')) {
            throw new Error('update() must be called with a where clause for non-singleton models');
        }
        var operation = {
            type: 'update',
            where: where
        };
        var operationResult = new ModelOperationResult(operation);
        validation_1.validateModel(model, meta, operation, options ? options.validation : null)
            .then(function (validationResult) {
            operationResult.validation = validationResult;
            if (validationResult.valid) {
                store.update(model, meta, where, operationResult, options)
                    .then(function () {
                    resolve(operationResult);
                })
                    .catch(function (err) {
                    reject(err);
                });
            }
            else {
                operationResult.addError(operationmsg_1.OPERATION_MESSAGES.failed_validation(meta.name), 'failed_validation');
                resolve(operationResult);
            }
        })
            .catch(function (err) {
            reject(err);
        });
    });
}
exports.update = update;
// TODO: it would be good if remove() worked with a model instance as well
//  ... in that case it would use the model's primary key (if present) to remove it.
function remove(model, where, options) {
    return new Promise(function (resolve, reject) {
        utils_1.checkIsModelConstructor(model);
        if (!where || typeof where != 'object') {
            throw new Error('remove() must be called with a where clause');
        }
        var meta = registry_1.registry.getMeta(model.name);
        var store = storage.get(meta.storage);
        if (meta.singleton) {
            throw new Error('remove() cannot be called on singleton models');
        }
        var operation = {
            type: 'remove',
            where: where
        };
        var operationResult = new ModelOperationResult(operation);
        validation_1.validateModelRemoval(meta, operation, options ? options.validation : null)
            .then(function (validationResult) {
            operationResult.validation = validationResult;
            if (validationResult.valid) {
                store.remove(meta, where, operationResult, options)
                    .then(function () {
                    resolve(operationResult);
                })
                    .catch(function (err) {
                    reject(err);
                });
            }
            else {
                operationResult.addError(operationmsg_1.OPERATION_MESSAGES.failed_validation(meta.name), 'failed_validation');
                resolve(operationResult);
            }
        })
            .catch(function (err) {
            reject(err);
        });
    });
}
exports.remove = remove;
function read(model, where, options) {
    return new Promise(function (resolve, reject) {
        utils_1.checkIsModelConstructor(model);
        var meta = registry_1.registry.getMeta(model.name);
        if (meta.singleton && where) {
            throw new Error('read() cannot be called with a where clause for singleton models');
        }
        var store = storage.get(meta.storage);
        var operation = {
            type: 'read',
            where: where
        };
        var operationResult = new ModelOperationResult(operation);
        store.read(model, meta, where || {}, operationResult, options)
            .then(function () {
            resolve(operationResult);
        })
            .catch(function (err) {
            reject(err);
        });
    });
}
exports.read = read;
