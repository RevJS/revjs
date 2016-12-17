
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
    minValue?: number | string;
    maxValue?: number | string;
    minLength?: number;
    maxLength?: number;
}

export interface IValidationOptions {
    timeout?: number;
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
        this.validators = [];
        this.asyncValidators = [];
        if (this.options.required || typeof this.options.required == 'undefined') {
            this.validators.push(validators.requiredValidator);
        }
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

export class BooleanField extends Field {
    constructor(name: string, label: string, options?: IFieldOptions) {
        super(name, label, options);
        this.validators.push(validators.booleanValidator);
    }
}

export class TextField extends Field {
    constructor(name: string, label: string, options?: IFieldOptions) {
        super(name, label, options);
        let o = this.options;
        let v = this.validators;
        if (o.required) {
            v.push(validators.stringEmptyValidator);
        }
        if (typeof o.minLength != 'undefined') {
            v.push(validators.minStringLengthValidator);
        }
        if (typeof o.maxLength != 'undefined') {
            v.push(validators.maxStringLengthValidator);
        }
        if (typeof o.minValue != 'undefined') {
            v.push(validators.minValueValidator);
        }
        if (typeof o.maxValue != 'undefined') {
            v.push(validators.maxValueValidator);
        }
    }
}

export class PasswordField extends TextField {}

export class NumberField extends Field {
    constructor(name: string, label: string, options?: IFieldOptions) {
        super(name, label, options);
        this.validators.push(validators.numberValidator);
        if (typeof this.options.minValue != 'undefined') {
            this.validators.push(validators.minValueValidator);
        }
        if (typeof this.options.maxValue != 'undefined') {
            this.validators.push(validators.maxValueValidator);
        }
    }
}

export class IntegerField extends NumberField {
    constructor(name: string, label: string, options?: IFieldOptions) {
        super(name, label, options);
        this.validators.push(validators.integerValidator);
        if (typeof this.options.minValue != 'undefined') {
            this.validators.push(validators.minValueValidator);
        }
        if (typeof this.options.maxValue != 'undefined') {
            this.validators.push(validators.maxValueValidator);
        }
    }
}

export class FloatField extends NumberField {}

export class DecimalField extends NumberField {}

export class DateField extends Field {}
export class DateTimeField extends Field {}

export class SelectionField extends Field {
    constructor(
            name: string,
            label: string,
            public selection: Array<[string, string]>,
            options?: IFieldOptions) {
        super(name, label, options);
        if (typeof this.selection != 'object' || !(this.selection instanceof Array)) {
            throw new Error('FieldError: SelectionField "selection" parameter must be an array');
        }
        for (let i=0; i<this.selection.length; i++) {  // tslint:disable-line
            if (typeof this.selection[i] != 'object' || !(this.selection[i] instanceof Array)
                    || this.selection[i].length != 2) {
                throw new Error(`FieldError: SelectionField selection item ${i} should be an array with two items`);
            }
        }
        this.validators.push(validators.selectionValidator);
    }
}

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
