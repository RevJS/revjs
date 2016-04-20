'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _validation = require('../errors/validation');

var _validation2 = _interopRequireDefault(_validation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// NOTE: Avoid ES6 default argument values (unless you want to hide those args from APIs!)

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
        value: function create(vals, options) {
            options = options || {};
            if (!vals) {
                throw new Error("create() requires the 'vals' parameter");
            }
            if (this.meta.singleton) {
                throw new Error("create() cannot be called on singleton models");
            }

            this.validateValues(vals);
            return this.registry.storage.create(this, vals, options);
        }
    }, {
        key: 'update',
        value: function update(vals, where, options) {
            where = where || null;
            options = options || {};
            if (!vals) {
                throw new Error("update() requires the 'vals' parameter");
            }
            if (!this.meta.singleton && !where) {
                throw new Error("update() requires the 'where' parameter for non-singleton models");
            }

            // TODO: Get existing vals when appropriate
            // vals = Object.assign(origVals, vals)

            this.validateValues(vals);
            return this.registry.storage.update(this, vals, where, options);
        }
    }, {
        key: 'get',
        value: function get(criteria, options) {
            options = options || {};
            return [{
                to_be_implemented: true
            }];
        }
    }]);

    return Model;
}();

exports.default = Model;
//# sourceMappingURL=index.js.map
