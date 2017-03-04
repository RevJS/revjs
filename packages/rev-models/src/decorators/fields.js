"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fld = require("../fields");
/* RevModel Field Decorators */
function addFieldMeta(target, fieldName, fieldObj) {
    if (!target.__fields) {
        target.__fields = [];
    }
    target.__fields.push(fieldObj);
}
// Text Fields
function TextField(label, options) {
    return function (target, propName) {
        addFieldMeta(target, propName, new fld.TextField(propName, label, options));
    };
}
exports.TextField = TextField;
function PasswordField(label, options) {
    return function (target, propName) {
        addFieldMeta(target, propName, new fld.PasswordField(propName, label, options));
    };
}
exports.PasswordField = PasswordField;
function EmailField(label, options) {
    return function (target, propName) {
        addFieldMeta(target, propName, new fld.EmailField(propName, label, options));
    };
}
exports.EmailField = EmailField;
function URLField(label, options) {
    return function (target, propName) {
        addFieldMeta(target, propName, new fld.URLField(propName, label, options));
    };
}
exports.URLField = URLField;
// Number Fields
function NumberField(label, options) {
    return function (target, propName) {
        addFieldMeta(target, propName, new fld.NumberField(propName, label, options));
    };
}
exports.NumberField = NumberField;
function IntegerField(label, options) {
    return function (target, propName) {
        addFieldMeta(target, propName, new fld.IntegerField(propName, label, options));
    };
}
exports.IntegerField = IntegerField;
// Selection Fields
function BooleanField(label, options) {
    return function (target, propName) {
        addFieldMeta(target, propName, new fld.BooleanField(propName, label, options));
    };
}
exports.BooleanField = BooleanField;
function SelectionField(label, selection, options) {
    return function (target, propName) {
        addFieldMeta(target, propName, new fld.SelectionField(propName, label, selection, options));
    };
}
exports.SelectionField = SelectionField;
// Date & Time Fields
function DateField(label, options) {
    return function (target, propName) {
        addFieldMeta(target, propName, new fld.DateField(propName, label, options));
    };
}
exports.DateField = DateField;
function TimeField(label, options) {
    return function (target, propName) {
        addFieldMeta(target, propName, new fld.TimeField(propName, label, options));
    };
}
exports.TimeField = TimeField;
function DateTimeField(label, options) {
    return function (target, propName) {
        addFieldMeta(target, propName, new fld.DateTimeField(propName, label, options));
    };
}
exports.DateTimeField = DateTimeField;
