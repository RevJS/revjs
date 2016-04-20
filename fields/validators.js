"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.requiredValidator = requiredValidator;
exports.minLengthValidator = minLengthValidator;
exports.maxLengthValidator = maxLengthValidator;
exports.numberValidator = numberValidator;
exports.integerValidator = integerValidator;
exports.minValueValidator = minValueValidator;
exports.maxValueValidator = maxValueValidator;
function requiredValidator(field, value) {
    if (field.required && !value) {
        return false;
    }
    return true;
}

function minLengthValidator(field, value) {
    if (field.minLength && value && value.length) {
        if (value.length < field.minLength) {
            return false;
        }
    }
    return true;
}

function maxLengthValidator(field, value) {
    if (field.maxLength && value && value.length) {
        if (value.length > field.maxLength) {
            return false;
        }
    }
    return true;
}

function numberValidator(field, value) {
    if (isNaN(value)) {
        return false;
    }
    return true;
}

function integerValidator(field, value) {
    if (!/^\d+$/.test(value)) {
        return false;
    }
    return true;
}

function minValueValidator(field, value) {
    if (field.minValue !== null) {
        if (value < field.minValue) {
            return false;
        }
    }
    return true;
}

function maxValueValidator(field, value) {
    if (field.maxValue !== null) {
        if (value > field.maxValue) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=validators.js.map
