
import * as validators from './validators';
import ValidationError from '../errors/validation';

export class Field {
    constructor(label, options = {}) {
        if (!label) {
            throw new Error('Fields must have a label');
        }
        this.label = label;
        this.required = (typeof options.required === 'boolean') ? options.required : true;

        this.validators = [
            ['required', validators.requiredValidator]
        ];
    }
    
    validateValue(value, checkAllValidators = true) {
        var failedValidators = [];
        for (var validator of this.validators) {
            if (!validator[1](this, value)) {
                failedValidators.push(validator[0]);
                if (!checkAllValidators) break;
            }
        }
        if (failedValidators.length) {
            throw new ValidationError(this, failedValidators);
        }
        else {
            return true;
        }
    }
}

export class StringField extends Field {
    constructor(label, options = {}) {
        super(label, options);
        this.minLength = options.minLength || null;
        this.maxLength = options.maxLength || null;
        this.validators.push(['minLength', validators.minLengthValidator]);
        this.validators.push(['maxLength', validators.maxLengthValidator]);
    }
}

export class PasswordField extends StringField {}

export class NumberField extends Field {
    constructor(label, options = {}) {
        super(label, options);
        this.minValue = options.minValue || null;
        this.maxValue = options.maxValue || null;
        this.validators.push(['invalidNumber', validators.numberValidator]);
        this.validators.push(['minValue', validators.minValueValidator]);
        this.validators.push(['maxValue', validators.maxValueValidator]);
    }
}

export class IntegerField extends NumberField {
    constructor(label, options = {}) {
        super(label, options);
        this.validators.push(['invalidInteger', validators.integerValidator]);
    }
}

export class FloatField extends NumberField {}

export class DecimalField extends NumberField {
    constructor(label, options = {}) {
        super(label, options);
        this.decimalPlaces = options.decimalPlaces || 2
    }
}

export class DateField extends Field {}