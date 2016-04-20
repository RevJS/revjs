"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ModelRegistry = function () {
    function ModelRegistry() {
        _classCallCheck(this, ModelRegistry);

        this.models = {};
    }

    _createClass(ModelRegistry, [{
        key: "addModel",
        value: function addModel(name, instance) {
            if (this.models[name]) {
                throw new Error("Model '" + name + "' is already present in this registry!");
            }
            this.models[name] = instance;
        }
    }, {
        key: "getModel",
        value: function getModel(name) {
            if (!this.models[name]) {
                throw new Error("Model '" + name + "' does not exist in this registry!");
            }
        }
    }]);

    return ModelRegistry;
}();

exports.default = ModelRegistry;
//# sourceMappingURL=registry.js.map
