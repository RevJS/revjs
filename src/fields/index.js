
import * as validators from './validators';

export class ValidationResult {
    constructor(isValid = true) {
        this.valid = isValid;
        this.failedValidators = [];        
    }
}

export class Field {
    constructor(label, options = {}) {
        this.required = options.required || true;
        
        this.validators = [
            ['required', validators.requiredValidator]
        ];
    }
    
    validateValue(value, checkAllValidators = true) {
        var res = new ValidationResult();
        for (var validator of this.validators) {
            if (!validator[1](this, value)) {
                res.valid = false;
                res.failedValidators.push(validator[0]);
                if (!checkAllValidators) return res;
            }
        }
        return res;
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
        this.validators.push(['minValue', validators.minValueValidator]);
        this.validators.push(['maxValue', validators.maxValueValidator]);
    }
}

export class IntegerField extends NumberField {}

export class FloatField extends NumberField {}

export class DecimalField extends NumberField {
    constructor(label, options = {}) {
        super(label, options);
        this.decimalPlaces = options.decimalPlaces || 2
    }
}

export class DateField extends Field {}