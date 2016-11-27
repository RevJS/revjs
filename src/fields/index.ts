
// import * as validators from './validators';
// import ValidationResult from './validationresult';

/*
        if (!label) {
            throw new Error('Fields must have a label');
        }
*/

export interface IFieldOptions {
    required?: boolean;
    size?: number | [number, number];
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
    decimalPlaces?: number;
}

export interface IValidationOptions {
    checkAllValidators: boolean;
}

export const DEFAULT_FIELD_OPTIONS: IFieldOptions = {
    required: true
};

export class Field {
    private validators: Array<any>;

    constructor(public name: string, public label: string, public options?: IFieldOptions) {
        this.options = this.options || {};
        this.validators = [
            // ["required", validators.requiredValidator]
        ];
    }

    public validateValue(value: any, options?: IValidationOptions) {
        let failedValidators: Array<any> = [];
        for (let validator of this.validators) {
            if (!validator[1](this, value)) {
                failedValidators.push(validator[0]);
                if (options && !options.checkAllValidators) {
                    break;
                }
            }
        }
        return true; // new ValidationResult(failedValidators.length == 0, failedValidators);
    }
}

export class BooleanField extends Field {}

export class TextField extends Field {
    constructor(name: string, label: string, options?: IFieldOptions) {
        super(name, label, options);
        /*
        this.validators.push(["minLength", validators.minLengthValidator]);
        this.validators.push(["maxLength", validators.maxLengthValidator]);
        */
    }
}

export class PasswordField extends TextField {}

export class NumberField extends Field {
    constructor(name: string, label: string, options?: IFieldOptions) {
        super(name, label, options);
        /*
        this.validators.push(["invalidNumber", validators.numberValidator]);
        this.validators.push(["minValue", validators.minValueValidator]);
        this.validators.push(["maxValue", validators.maxValueValidator]);
        */
    }
}

export class IntegerField extends NumberField {
    constructor(name: string, label: string, options?: IFieldOptions) {
        super(name, label, options);
        // this.validators.push(["invalidInteger", validators.integerValidator]);
    }
}

export class FloatField extends NumberField {}

export class DecimalField extends NumberField {
    constructor(name: string, label: string, options?: IFieldOptions) {
        super(name, label, options);
    }
}

export class DateField extends Field {}
export class DateTimeField extends Field {}

export class RelatedRecord extends Field {}
export class RelatedRecordList extends Field {}
