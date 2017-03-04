"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var validationmsg_1 = require("../fields/validationmsg");
var utils_1 = require("./utils");
var ModelValidationResult = (function () {
    function ModelValidationResult(valid) {
        if (typeof valid == 'undefined') {
            this.valid = true;
        }
        else {
            if (typeof valid != 'boolean') {
                throw new Error('ValidationError: First argument to the ValidationResult constructor must be a boolean.');
            }
            this.valid = valid;
        }
        this.fieldErrors = {};
        this.modelErrors = [];
        this.validationFinished = true;
    }
    ModelValidationResult.prototype.addFieldError = function (fieldName, message, code, data) {
        if (!fieldName) {
            throw new Error("ValidationError: You must specify fieldName when adding a field error.");
        }
        this.valid = false;
        if (!(fieldName in this.fieldErrors)) {
            this.fieldErrors[fieldName] = [];
        }
        var fieldError = {
            message: message
        };
        if (code) {
            fieldError.code = code;
        }
        if (data) {
            if (typeof data != 'object') {
                throw new Error("ValidationError: You cannot add non-object data to a validation error (field: \"" + fieldName + "\").");
            }
            Object.assign(fieldError, data);
        }
        this.fieldErrors[fieldName].push(fieldError);
    };
    ModelValidationResult.prototype.addModelError = function (message, code, data) {
        if (!message) {
            throw new Error("ValidationError: You must specify a message for a model error.");
        }
        this.valid = false;
        var modelError = {
            message: message
        };
        if (code) {
            modelError.code = code;
        }
        if (data) {
            if (typeof data != 'object') {
                throw new Error("ValidationError: You cannot add non-object data to a model validation error.");
            }
            Object.assign(modelError, data);
        }
        this.modelErrors.push(modelError);
    };
    return ModelValidationResult;
}());
exports.ModelValidationResult = ModelValidationResult;
// TODO: validate() function that does not require meta (gets it from the registry)
function validateModel(model, meta, operation, options) {
    return new Promise(function (resolve, reject) {
        utils_1.checkIsModelInstance(model);
        utils_1.checkMetadataInitialised(meta);
        if (!operation || typeof operation != 'object' || ['create', 'update'].indexOf(operation.type) == -1) {
            throw new Error('validateModel() - invalid operation specified - should either be a create or update operation.');
        }
        var timeout = options && options.timeout ? options.timeout : 5000;
        var result = new ModelValidationResult();
        // First, check if model contains fields that are not in meta
        for (var field in model) {
            if (!(field in meta.fieldsByName)) {
                result.addModelError(validationmsg_1.VALIDATION_MESSAGES.extra_field(field), 'extra_field');
            }
        }
        // Trigger field validation
        var promises = [];
        for (var _i = 0, _a = meta.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            promises.push(field.validate(model, meta, operation, result, options));
        }
        Promise.all(promises)
            .then(function () {
            // Trigger model validation
            if (meta.validate) {
                meta.validate(model, operation, result, options);
            }
            if (meta.validateAsync) {
                return meta.validateAsync(model, operation, result, options);
            }
        })
            .then(function () {
            resolve(result);
        })
            .catch(function (err) {
            reject(err);
        });
        setTimeout(function () {
            reject(new Error("validateModel() - timed out after " + timeout + " milliseconds"));
        }, timeout);
    });
}
exports.validateModel = validateModel;
function validateModelRemoval(meta, operation, options) {
    return new Promise(function (resolve, reject) {
        utils_1.checkMetadataInitialised(meta);
        if (!operation || typeof operation != 'object' || operation.type != 'remove') {
            throw new Error('validateModelRemoval() - invalid operation specified - operation.type must be "remove".');
        }
        if (!operation.where || typeof operation.where != 'object') {
            throw new Error('validateModelRemoval() - invalid operation where clause specified.');
        }
        var timeout = options && options.timeout ? options.timeout : 5000;
        var result = new ModelValidationResult();
        if (meta.validateRemoval) {
            meta.validateRemoval(operation, result, options);
        }
        if (meta.validateRemovalAsync) {
            meta.validateRemovalAsync(operation, result, options)
                .then(function () {
                resolve(result);
            })
                .catch(function (err) {
                reject(err);
            });
        }
        else {
            resolve(result);
        }
        setTimeout(function () {
            reject(new Error("validateRemoval() - timed out after " + timeout + " milliseconds"));
        }, timeout);
    });
}
exports.validateModelRemoval = validateModelRemoval;
