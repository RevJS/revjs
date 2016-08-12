"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
    function ExtendableBuiltin() {
        var instance = Reflect.construct(cls, Array.from(arguments));
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
        return instance;
    }

    ExtendableBuiltin.prototype = Object.create(cls.prototype, {
        constructor: {
            value: cls,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(ExtendableBuiltin, cls);
    } else {
        ExtendableBuiltin.__proto__ = cls;
    }

    return ExtendableBuiltin;
}

var ValidationError = function (_extendableBuiltin2) {
    _inherits(ValidationError, _extendableBuiltin2);

    function ValidationError(field) {
        var failedValidators = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        _classCallCheck(this, ValidationError);

        var message = "ValidationError: Field '" + (field.label || field) + "' failed validation. [" + failedValidators + "]";

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ValidationError).call(this, message));

        _this.field = field;
        _this.failedValidators = failedValidators;
        return _this;
    }

    return ValidationError;
}(_extendableBuiltin(Error));

exports.default = ValidationError;