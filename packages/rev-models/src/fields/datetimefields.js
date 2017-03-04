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
var DateField = (function (_super) {
    __extends(DateField, _super);
    function DateField(name, label, options) {
        var _this = _super.call(this, name, label, options) || this;
        _this.validators.push(validators.dateOnlyValidator);
        return _this;
    }
    return DateField;
}(field_1.Field));
exports.DateField = DateField;
var TimeField = (function (_super) {
    __extends(TimeField, _super);
    function TimeField(name, label, options) {
        var _this = _super.call(this, name, label, options) || this;
        _this.validators.push(validators.timeOnlyValidator);
        return _this;
    }
    return TimeField;
}(field_1.Field));
exports.TimeField = TimeField;
var DateTimeField = (function (_super) {
    __extends(DateTimeField, _super);
    function DateTimeField(name, label, options) {
        var _this = _super.call(this, name, label, options) || this;
        _this.validators.push(validators.dateTimeValidator);
        return _this;
    }
    return DateTimeField;
}(field_1.Field));
exports.DateTimeField = DateTimeField;
