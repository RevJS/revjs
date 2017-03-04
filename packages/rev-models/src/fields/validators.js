"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var validationmsg_1 = require("./validationmsg");
var utils_1 = require("../utils");
function requiredValidator(model, field, meta, operation, result, options) {
    if (!utils_1.isSet(model[field.name])) {
        result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.required(field.label), 'required');
    }
}
exports.requiredValidator = requiredValidator;
function stringValidator(model, field, meta, operation, result, options) {
    if (utils_1.isSet(model[field.name]) && typeof model[field.name] != 'string') {
        result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.not_a_string(field.label), 'not_a_string');
    }
}
exports.stringValidator = stringValidator;
function stringEmptyValidator(model, field, meta, operation, result, options) {
    if (typeof model[field.name] == 'string'
        && model[field.name].length == 0) {
        result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.string_empty(field.label), 'string_empty');
    }
}
exports.stringEmptyValidator = stringEmptyValidator;
function regExValidator(model, field, meta, operation, result, options) {
    if (typeof model[field.name] == 'string'
        && typeof field.options.regEx == 'object'
        && field.options.regEx instanceof RegExp
        && !field.options.regEx.test(model[field.name])) {
        result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.no_regex_match(field.label), 'no_regex_match');
    }
}
exports.regExValidator = regExValidator;
function numberValidator(model, field, meta, operation, result, options) {
    if (utils_1.isSet(model[field.name]) && (isNaN(model[field.name]) || model[field.name] === '')) {
        result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.not_a_number(field.label), 'not_a_number');
    }
}
exports.numberValidator = numberValidator;
function integerValidator(model, field, meta, operation, result, options) {
    if (utils_1.isSet(model[field.name]) && !(/^(-?[1-9][0-9]*|0)$/.test(model[field.name]))) {
        result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.not_an_integer(field.label), 'not_an_integer');
    }
}
exports.integerValidator = integerValidator;
function booleanValidator(model, field, meta, operation, result, options) {
    if (utils_1.isSet(model[field.name]) && typeof model[field.name] != 'boolean') {
        result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.not_a_boolean(field.label), 'not_a_boolean');
    }
}
exports.booleanValidator = booleanValidator;
function minStringLengthValidator(model, field, meta, operation, result, options) {
    if (typeof model[field.name] == 'string'
        && model[field.name].length < field.options.minLength) {
        result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.min_string_length(field.label, field.options.minLength), 'min_string_length');
    }
}
exports.minStringLengthValidator = minStringLengthValidator;
function maxStringLengthValidator(model, field, meta, operation, result, options) {
    if (typeof model[field.name] == 'string'
        && model[field.name].length > field.options.maxLength) {
        result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.max_string_length(field.label, field.options.maxLength), 'max_string_length');
    }
}
exports.maxStringLengthValidator = maxStringLengthValidator;
function minValueValidator(model, field, meta, operation, result, options) {
    if (utils_1.isSet(model[field.name])
        && model[field.name] < field.options.minValue) {
        result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.min_value(field.label, field.options.minValue), 'min_value');
    }
}
exports.minValueValidator = minValueValidator;
function maxValueValidator(model, field, meta, operation, result, options) {
    if (utils_1.isSet(model[field.name])
        && model[field.name] > field.options.maxValue) {
        result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.max_value(field.label, field.options.maxValue), 'max_value');
    }
}
exports.maxValueValidator = maxValueValidator;
function singleSelectionValidator(model, field, meta, operation, result, options) {
    if (utils_1.isSet(model[field.name])) {
        for (var _i = 0, _a = field.selection; _i < _a.length; _i++) {
            var opt = _a[_i];
            if (opt[0] == model[field.name]) {
                return;
            }
        }
        result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.no_selection_match(field.label), 'no_selection_match');
    }
}
exports.singleSelectionValidator = singleSelectionValidator;
function listEmptyValidator(model, field, meta, operation, result, options) {
    if (typeof model[field.name] == 'object' && model[field.name] instanceof Array
        && model[field.name].length == 0) {
        result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.list_empty(field.label), 'list_empty');
    }
}
exports.listEmptyValidator = listEmptyValidator;
function multipleSelectionValidator(model, field, meta, operation, result, options) {
    if (utils_1.isSet(model[field.name])) {
        if (typeof model[field.name] != 'object' || !(model[field.name] instanceof Array)) {
            result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.selection_not_an_array(field.label), 'selection_not_an_array');
        }
        else {
            var matches = 0;
            for (var _i = 0, _a = model[field.name]; _i < _a.length; _i++) {
                var val = _a[_i];
                for (var _b = 0, _c = field.selection; _b < _c.length; _b++) {
                    var opt = _c[_b];
                    if (opt[0] == val) {
                        matches++;
                        break;
                    }
                }
            }
            if (matches < model[field.name].length) {
                result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.no_selection_match(field.label), 'no_selection_match');
            }
        }
    }
}
exports.multipleSelectionValidator = multipleSelectionValidator;
var dateOnlyRegex = /^[0-9]{4}-[01][0-9]-[0-3][0-9]$/;
var timeOnlyRegex = /^[0-2][0-9]:[0-5][0-9]:[0-5][0-9]$/;
var dateTimeRegex = /^[0-9]{4}-[01][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]$/;
function dateOnlyValidator(model, field, meta, operation, result, options) {
    if (utils_1.isSet(model[field.name])) {
        if (typeof model[field.name] == 'object' && model[field.name] instanceof Date) {
            return;
        }
        if (typeof model[field.name] != 'string'
            || !(model[field.name].match(dateOnlyRegex))
            || !Date.parse(model[field.name])) {
            result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.not_a_date(field.label), 'not_a_date');
        }
    }
}
exports.dateOnlyValidator = dateOnlyValidator;
function timeOnlyValidator(model, field, meta, operation, result, options) {
    if (utils_1.isSet(model[field.name])) {
        if (typeof model[field.name] == 'object' && model[field.name] instanceof Date) {
            return;
        }
        if (typeof model[field.name] != 'string'
            || !(model[field.name].match(timeOnlyRegex))
            || !Date.parse('2000-01-01T' + model[field.name])) {
            result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.not_a_time(field.label), 'not_a_time');
        }
    }
}
exports.timeOnlyValidator = timeOnlyValidator;
function dateTimeValidator(model, field, meta, operation, result, options) {
    if (utils_1.isSet(model[field.name])) {
        if (typeof model[field.name] == 'object' && model[field.name] instanceof Date) {
            return;
        }
        if (typeof model[field.name] != 'string'
            || !(model[field.name].match(dateTimeRegex))
            || !Date.parse(model[field.name])) {
            result.addFieldError(field.name, validationmsg_1.VALIDATION_MESSAGES.not_a_datetime(field.label), 'not_a_datetime');
        }
    }
}
exports.dateTimeValidator = dateTimeValidator;
