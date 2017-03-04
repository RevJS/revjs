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
var BooleanField = (function (_super) {
    __extends(BooleanField, _super);
    function BooleanField(name, label, options) {
        var _this = _super.call(this, name, label, options) || this;
        _this.validators.push(validators.booleanValidator);
        return _this;
    }
    return BooleanField;
}(field_1.Field));
exports.BooleanField = BooleanField;
var SelectionField = (function (_super) {
    __extends(SelectionField, _super);
    function SelectionField(name, label, selection, options) {
        var _this = _super.call(this, name, label, options) || this;
        _this.selection = selection;
        if (typeof _this.selection != 'object' || !(_this.selection instanceof Array)) {
            throw new Error('FieldError: SelectionField "selection" parameter must be an array');
        }
        for (var i = 0; i < _this.selection.length; i++) {
            if (typeof _this.selection[i] != 'object' || !(_this.selection[i] instanceof Array)
                || _this.selection[i].length != 2) {
                throw new Error("FieldError: SelectionField selection item " + i + " should be an array with two items");
            }
        }
        if (_this.options.required) {
            _this.validators.push(_this.options.multiple ?
                validators.listEmptyValidator :
                validators.stringEmptyValidator);
        }
        _this.validators.push(_this.options.multiple ?
            validators.multipleSelectionValidator :
            validators.singleSelectionValidator);
        return _this;
    }
    return SelectionField;
}(field_1.Field));
exports.SelectionField = SelectionField;
