'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _storage = require('./storage');

var _storage2 = _interopRequireDefault(_storage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ExpressSessionStorage = function (_ModelStorage) {
    _inherits(ExpressSessionStorage, _ModelStorage);

    function ExpressSessionStorage() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, ExpressSessionStorage);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ExpressSessionStorage).call(this, options));

        _this.sessionKey = options.sessionKey || 'models';
        return _this;
    }

    _createClass(ExpressSessionStorage, [{
        key: 'create',
        value: function create(model, vals) {
            var _this2 = this;

            var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            return new Promise(function (resolve) {
                if (!options.session) {
                    throw new Error("ExpressSessionStorage.create() requires 'session' option to be specified.");
                }
                if (model.meta.singleton) {
                    throw new Error("ExpressSessionStorage.create() cannot be called on singleton models");
                }
                if (!(_this2.sessionKey in options.session)) options.session[_this2.sessionKey] = {};
                var modelData = options.session[_this2.sessionKey];
                if (!(model.meta.tableName in modelData)) {
                    modelData[model.meta.tableName] = [];
                }
                throw new Error('ExpressSessionStorage.create() not yet implemented :-)');
            });
        }
    }, {
        key: 'update',
        value: function update(model, vals) {
            var _this3 = this;

            var where = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

            return new Promise(function (resolve) {
                if (!options.session) {
                    throw new Error("ExpressSessionStorage.update() requires 'session' option to be specified.");
                }
                if (!model.meta.singleton && !where) {
                    throw new Error("ExpressSessionStorage.update() requires the 'where' parameter for non-singleton models");
                }
                if (!(_this3.sessionKey in options.session)) options.session[_this3.sessionKey] = {};
                var modelData = options.session[_this3.sessionKey];
                if (!(model.meta.tableName in modelData)) {
                    if (model.meta.singleton) {
                        modelData[model.meta.tableName] = {};
                    } else {
                        modelData[model.meta.tableName] = [];
                    }
                }
                if (model.meta.singleton) {
                    modelData[model.meta.tableName] = Object.assign(modelData[model.meta.tableName], vals);
                    resolve(true);
                } else {
                    throw new Error('Non-singleton Session Storage updates not yet implemented!');
                }
            });
        }
    }, {
        key: 'get',
        value: function get(model) {
            var _this4 = this;

            var where = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
            var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            return new Promise(function (resolve) {
                if (!options.session) {
                    throw new Error("ExpressSessionStorage.update() requires 'session' option to be specified.");
                }
                if (!model.meta.singleton && !where) {
                    throw new Error("ExpressSessionStorage.update() requires the 'where' parameter for non-singleton models");
                }

                if (!(_this4.sessionKey in options.session) || !(model.meta.tableName in options.session[_this4.sessionKey])) {

                    if (model.meta.singleton) {
                        resolve({});
                    } else {
                        resolve([]);
                    }
                } else {
                    var modelData = options.session[_this4.sessionKey][model.meta.tableName];
                    if (model.meta.singleton) {
                        resolve(modelData);
                    } else {
                        throw new Error('Non-singleton Session Storage get() not yet implemented!');
                    }
                }
            });
        }
    }]);

    return ExpressSessionStorage;
}(_storage2.default);

exports.default = ExpressSessionStorage;