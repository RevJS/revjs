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
var Operator = (function () {
    function Operator() {
    }
    return Operator;
}());
exports.Operator = Operator;
var ValueOperator = (function (_super) {
    __extends(ValueOperator, _super);
    function ValueOperator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ValueOperator;
}(Operator));
exports.ValueOperator = ValueOperator;
var ValueListOperator = (function (_super) {
    __extends(ValueListOperator, _super);
    function ValueListOperator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ValueListOperator;
}(Operator));
exports.ValueListOperator = ValueListOperator;
var ConjunctionOperator = (function (_super) {
    __extends(ConjunctionOperator, _super);
    function ConjunctionOperator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ConjunctionOperator;
}(Operator));
exports.ConjunctionOperator = ConjunctionOperator;
