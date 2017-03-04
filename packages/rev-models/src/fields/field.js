"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var models_1 = require("../models");
var utils_1 = require("../utils");
var validators = require("./validators");
exports.DEFAULT_FIELD_OPTIONS = {
    required: true
};
function getOptions(options) {
    if (utils_1.isSet(options)) {
        if (typeof options != 'object') {
            throw new Error('FieldError: the options parameter must be an object');
        }
        return options;
    }
    else {
        return Object.assign({}, exports.DEFAULT_FIELD_OPTIONS);
    }
}
exports.getOptions = getOptions;
var Field = (function () {
    function Field(name, label, options) {
        this.name = name;
        this.label = label;
        this.options = options;
        if (!name || typeof name != 'string') {
            throw new Error('FieldError: new fields must have a name');
        }
        if (!label || typeof label != 'string') {
            throw new Error('FieldError: new fields must have a label');
        }
        this.options = getOptions(options);
        this.validators = [];
        this.asyncValidators = [];
        if (this.options.required || typeof this.options.required == 'undefined') {
            this.validators.push(validators.requiredValidator);
        }
    }
    Field.prototype.validate = function (model, meta, operation, result, options) {
        var _this = this;
        var timeout = options && options.timeout ? options.timeout : 5000;
        models_1.checkIsModelInstance(model);
        return new Promise(function (resolve, reject) {
            // Run synchronous validators
            for (var _i = 0, _a = _this.validators; _i < _a.length; _i++) {
                var validator = _a[_i];
                validator(model, _this, meta, operation, result, options);
            }
            // Run asynchronous validators
            if (_this.asyncValidators.length > 0) {
                var promises = [];
                for (var _b = 0, _c = _this.asyncValidators; _b < _c.length; _b++) {
                    var asyncValidator = _c[_b];
                    promises.push(asyncValidator(model, _this, meta, operation, result, options));
                }
                Promise.all(promises)
                    .then(function () {
                    resolve(result);
                });
                setTimeout(function () {
                    reject(new Error("Field validate() - timed out after " + timeout + " milliseconds"));
                }, timeout);
            }
            else {
                // Resolve immediately
                resolve(result);
            }
        });
    };
    return Field;
}());
exports.Field = Field;
