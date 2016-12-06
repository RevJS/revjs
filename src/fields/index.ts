
import { IModel, IModelMeta, ValidationMode } from '../model';
import { ModelValidationResult } from './../model/validationresult';
import * as validators from './validators';

export interface IFieldValidator {
    <T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): void;
}

export interface IAsyncFieldValidator {
    <T extends IModel>(model: T, field: Field, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): Promise<void>;
}

export interface IFieldOptions {
    required?: boolean;
    size?: number | [number, number];
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
    decimalPlaces?: number;
    validators?: IFieldValidator[];
    asyncValidators?: IAsyncFieldValidator[];
}

export interface IValidationOptions {
    checkAllValidators: boolean;
}

export const DEFAULT_FIELD_OPTIONS: IFieldOptions = {
    required: true
};

export class Field {
    public validators: IFieldValidator[];
    public asyncValidators: IAsyncFieldValidator[];

    constructor(public name: string, public label: string, public options?: IFieldOptions) {
        if (!name || typeof name != 'string') {
            throw new Error('FieldError: new fields must have a name');
        }
        if (!label || typeof label != 'string') {
            throw new Error('FieldError: new fields must have a label');
        }
        this.options = options || Object.assign({}, DEFAULT_FIELD_OPTIONS);
        if (typeof this.options != 'object') {
            throw new Error('FieldError: the options parameter must be an object');
        }
        if (typeof this.options.required != 'boolean') {
            this.options.required = true;
        }
        this.validators = [
            validators.requiredValidator
        ];
        // TODO: Add extra validators from field options
    }

    /*public validate(value: any, options?: IValidationOptions) {
        let failedValidators: any[] = [];
        for (let validator of this.validators) {
            if (!validator[1](this, value)) {
                failedValidators.push(validator[0]);
                if (options && !options.checkAllValidators) {
                    break;
                }
            }
        }
        return true; // new ValidationResult(failedValidators.length == 0, failedValidators);
    }*/
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

export class RelatedRecord extends Field {
    constructor(
            name: string,
            label: string,
            relatedModel: new () => IModel,
            options?: IFieldOptions) {
        super(name, label, options);
    }
}

export class RelatedRecordList extends Field {
    constructor(
            name: string,
            label: string,
            relatedModel: new () => IModel,
            options?: IFieldOptions) {
        super(name, label, options);
    }
}
