'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _validation = require('../errors/validation');

var _validation2 = _interopRequireDefault(_validation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Model = function () {
    function Model(options) {
        _classCallCheck(this, Model);

        this.registry = null;
        this.fields = this.getFields ? this.getFields() : {};
        this.meta = this.getMeta ? this.getMeta() : {};

        if (!this.meta.tableName) {
            this.meta.tableName = this.constructor.name;
        }
    }

    _createClass(Model, [{
        key: 'validateValues',
        value: function validateValues(vals) {
            for (var fieldName in vals) {
                if (!(fieldName in this.fields)) {
                    throw new _validation2.default(fieldName, ['extraField']);
                } else {
                    this.fields[fieldName].validateValue(vals[fieldName]);
                }
            }
        }
    }, {
        key: 'create',
        value: function create(createVals) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            if (!createVals) {
                throw new Error("create() requires the 'createVals' parameter");
            }
            if (this.meta.singleton) {
                throw new Error("create() cannot be called on singleton models");
            }

            this.validateValues(createVals);
            return this.registry.storage.create(this, createVals, options);
        }
    }, {
        key: 'update',
        value: function update(updateVals) {
            var where = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
            var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            if (!updateVals) {
                throw new Error("update() requires the 'updateVals' parameter");
            }
            if (!this.meta.singleton && !where) {
                throw new Error("update() requires the 'where' parameter for non-singleton models");
            }

            // TODO: Get existing vals when appropriate
            // updateVals = Object.assign(origVals, updateVals)

            this.validateValues(updateVals);
            return this.registry.storage.update(this, updateVals, where, options);
        }
    }]);

    return Model;
}();

exports.default = Model;
//# sourceMappingURL=index.js.map
