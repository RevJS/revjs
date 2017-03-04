"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var field_1 = require("./field");
var validators = require("./validators");
exports.EMAIL_ADDR_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
exports.URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/;
var TextField = (function (_super) {
    __extends(TextField, _super);
    function TextField(name, label, options) {
        var _this = _super.call(this, name, label, options) || this;
        var o = _this.options;
        var v = _this.validators;
        v.push(validators.stringValidator);
        if (o.required) {
            v.push(validators.stringEmptyValidator);
        }
        if (typeof o.minLength != 'undefined') {
            v.push(validators.minStringLengthValidator);
        }
        if (typeof o.maxLength != 'undefined') {
            v.push(validators.maxStringLengthValidator);
        }
        if (typeof o.minValue != 'undefined') {
            v.push(validators.minValueValidator);
        }
        if (typeof o.maxValue != 'undefined') {
            v.push(validators.maxValueValidator);
        }
        if (typeof o.regEx == 'object' && o.regEx instanceof RegExp) {
            v.push(validators.regExValidator);
        }
        return _this;
    }
    return TextField;
}(field_1.Field));
exports.TextField = TextField;
var PasswordField = (function (_super) {
    __extends(PasswordField, _super);
    function PasswordField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PasswordField;
}(TextField));
exports.PasswordField = PasswordField;
var EmailField = (function (_super) {
    __extends(EmailField, _super);
    function EmailField(name, label, options) {
        var _this = this;
        var opts = field_1.getOptions(options);
        if (!opts.regEx
            || typeof opts.regEx != 'object'
            || !(opts.regEx instanceof RegExp)) {
            opts.regEx = exports.EMAIL_ADDR_REGEX;
        }
        _this = _super.call(this, name, label, opts) || this;
        return _this;
    }
    return EmailField;
}(TextField));
exports.EmailField = EmailField;
var URLField = (function (_super) {
    __extends(URLField, _super);
    function URLField(name, label, options) {
        var _this = this;
        var opts = field_1.getOptions(options);
        if (!opts.regEx
            || typeof opts.regEx != 'object'
            || !(opts.regEx instanceof RegExp)) {
            opts.regEx = exports.URL_REGEX;
        }
        _this = _super.call(this, name, label, opts) || this;
        return _this;
    }
    return URLField;
}(TextField));
exports.URLField = URLField;
