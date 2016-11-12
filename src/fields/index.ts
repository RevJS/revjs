
// import * as validators from './validators';
// import ValidationResult from './validationresult';

/*
        if (!label) {
            throw new Error('Fields must have a label');
        }
*/

export interface IFieldOptions {
    required?: boolean;
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
    decimalPlaces?: number;
}

export const DEFAULT_FIELD_OPTIONS: IFieldOptions = {
    required: true
};

export class FieldType {
    private validators: Array<any>;

    constructor(private label: string, private options: IFieldOptions) {
        this.validators = [
            // ["required", validators.requiredValidator]
        ];
    }

    public validateValue(value: any, checkAllValidators = true) {
        let failedValidators: Array<any> = [];
        for (let validator of this.validators) {
            if (!validator[1](this, value)) {
                failedValidators.push(validator[0]);
                if (!checkAllValidators) {
                    break;
                }
            }
        }
        return true; // new ValidationResult(failedValidators.length == 0, failedValidators);
    }
}

export class BooleanField extends FieldType {}

export class TextField extends FieldType {
    constructor(label: string, options: IFieldOptions) {
        super(label, options);
        /*
        this.validators.push(["minLength", validators.minLengthValidator]);
        this.validators.push(["maxLength", validators.maxLengthValidator]);
        */
    }
}

export class PasswordField extends TextField {}

export class NumberField extends FieldType {
    constructor(label: string, options: IFieldOptions) {
        super(label, options);
        /*
        this.validators.push(["invalidNumber", validators.numberValidator]);
        this.validators.push(["minValue", validators.minValueValidator]);
        this.validators.push(["maxValue", validators.maxValueValidator]);
        */
    }
}

export class IntegerField extends NumberField {
    constructor(label: string, options: IFieldOptions) {
        super(label, options);
        // this.validators.push(["invalidInteger", validators.integerValidator]);
    }
}

export class FloatField extends NumberField {}

export class DecimalField extends NumberField {
    constructor(label: string, options: IFieldOptions) {
        super(label, options);
    }
}

export class DateField extends FieldType {}
export class DateTimeField extends FieldType {}

export class RelatedRecord extends FieldType {}
export class RelatedRecordList extends FieldType {}
