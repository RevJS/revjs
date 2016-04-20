'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DateField = exports.DecimalField = exports.FloatField = exports.IntegerField = exports.NumberField = exports.PasswordField = exports.StringField = exports.Field = exports.ValidationResult = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _validators = require('./validators');

var validators = _interopRequireWildcard(_validators);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ValidationResult = exports.ValidationResult = function ValidationResult() {
    var isValid = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

    _classCallCheck(this, ValidationResult);

    this.valid = isValid;
    this.failedValidators = [];
};

var Field = exports.Field = function () {
    function Field(label) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Field);

        this.required = options.required || true;

        this.validators = [['required', validators.requiredValidator]];
    }

    _createClass(Field, [{
        key: 'validateValue',
        value: function validateValue(value) {
            var checkAllValidators = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            var res = new ValidationResult();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.validators[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var validator = _step.value;

                    if (!validator[1](this, value)) {
                        res.valid = false;
                        res.failedValidators.push(validator[0]);
                        if (!checkAllValidators) return res;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return res;
        }
    }]);

    return Field;
}();

var StringField = exports.StringField = function (_Field) {
    _inherits(StringField, _Field);

    function StringField(label) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, StringField);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StringField).call(this, label, options));

        _this.minLength = options.minLength || null;
        _this.maxLength = options.maxLength || null;
        _this.validators.push(['minLength', validators.minLengthValidator]);
        _this.validators.push(['maxLength', validators.maxLengthValidator]);
        return _this;
    }

    return StringField;
}(Field);

var PasswordField = exports.PasswordField = function (_StringField) {
    _inherits(PasswordField, _StringField);

    function PasswordField() {
        _classCallCheck(this, PasswordField);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(PasswordField).apply(this, arguments));
    }

    return PasswordField;
}(StringField);

var NumberField = exports.NumberField = function (_Field2) {
    _inherits(NumberField, _Field2);

    function NumberField(label) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, NumberField);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(NumberField).call(this, label, options));

        _this3.minValue = options.minValue || null;
        _this3.maxValue = options.maxValue || null;
        _this3.validators.push(['minValue', validators.minValueValidator]);
        _this3.validators.push(['maxValue', validators.maxValueValidator]);
        return _this3;
    }

    return NumberField;
}(Field);

var IntegerField = exports.IntegerField = function (_NumberField) {
    _inherits(IntegerField, _NumberField);

    function IntegerField() {
        _classCallCheck(this, IntegerField);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(IntegerField).apply(this, arguments));
    }

    return IntegerField;
}(NumberField);

var FloatField = exports.FloatField = function (_NumberField2) {
    _inherits(FloatField, _NumberField2);

    function FloatField() {
        _classCallCheck(this, FloatField);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FloatField).apply(this, arguments));
    }

    return FloatField;
}(NumberField);

var DecimalField = exports.DecimalField = function (_NumberField3) {
    _inherits(DecimalField, _NumberField3);

    function DecimalField(label) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, DecimalField);

        var _this6 = _possibleConstructorReturn(this, Object.getPrototypeOf(DecimalField).call(this, label, options));

        _this6.decimalPlaces = options.decimalPlaces || 2;
        return _this6;
    }

    return DecimalField;
}(NumberField);

var DateField = exports.DateField = function (_Field3) {
    _inherits(DateField, _Field3);

    function DateField() {
        _classCallCheck(this, DateField);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(DateField).apply(this, arguments));
    }

    return DateField;
}(Field);
//# sourceMappingURL=index.js.map
