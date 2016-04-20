"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _storage = require("./storage");

var _storage2 = _interopRequireDefault(_storage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ExpressSessionStorage = function (_ModelStorage) {
    _inherits(ExpressSessionStorage, _ModelStorage);

    function ExpressSessionStorage() {
        _classCallCheck(this, ExpressSessionStorage);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(ExpressSessionStorage).apply(this, arguments));
    }

    _createClass(ExpressSessionStorage, [{
        key: "create",
        value: function create(model, createVals, options) {
            return new Promise(function (resolve) {
                if (!options.session) {
                    throw new Error("ExpressSessionStorage.create() requires 'session' option to be specified.");
                }
                if (model.meta.singleton) {
                    throw new Error("ExpressSessionStorage.create() cannot be called on singleton models");
                }
                if (!options.session[model.meta.tableName]) {
                    session[model.meta.tableName] = [];
                }
                resolve(true);
            });
        }
    }, {
        key: "update",
        value: function update(model, updateVals) {
            var where = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

            return new Promise(function (resolve) {
                if (!options.session) {
                    throw new Error("ExpressSessionStorage.update() requires 'session' option to be specified.");
                }
                if (!model.meta.singleton && !where) {
                    throw new Error("ExpressSessionStorage.update() requires the 'where' parameter for non-singleton models");
                }
                if (!options.session[model.meta.tableName]) {
                    if (model.meta.singleton) {
                        options.session[model.meta.tableName] = {};
                    } else {
                        options.session[model.meta.tableName] = [];
                    }
                }
                if (model.meta.singleton) {
                    options.session[model.meta.tableName] = Object.assign(options.session[model.meta.tableName], updateVals);
                    resolve(true);
                } else {
                    throw new Error('Non-singleton Session Storage updates not yet implemented!');
                }
            });
        }
    }]);

    return ExpressSessionStorage;
}(_storage2.default);

exports.default = ExpressSessionStorage;
//# sourceMappingURL=express-session.js.map
