"use strict";
var Model = (function () {
    function Model(name) {
        this.name = name;
    }
    Model.prototype.getName = function () {
        return this.name;
    };
    return Model;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Model;
