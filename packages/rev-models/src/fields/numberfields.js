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
var NumberField = (function (_super) {
    __extends(NumberField, _super);
    function NumberField(name, label, options) {
        var _this = _super.call(this, name, label, options) || this;
        _this.validators.push(validators.numberValidator);
        if (typeof _this.options.minValue != 'undefined') {
            _this.validators.push(validators.minValueValidator);
        }
        if (typeof _this.options.maxValue != 'undefined') {
            _this.validators.push(validators.maxValueValidator);
        }
        return _this;
    }
    return NumberField;
}(field_1.Field));
exports.NumberField = NumberField;
var IntegerField = (function (_super) {
    __extends(IntegerField, _super);
    function IntegerField(name, label, options) {
        var _this = _super.call(this, name, label, options) || this;
        var validatorIdx = _this.options.required ? 2 : 1;
        _this.validators.splice(validatorIdx, 0, validators.integerValidator);
        return _this;
    }
    return IntegerField;
}(NumberField));
exports.IntegerField = IntegerField;
