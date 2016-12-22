
import { IModel, IModelMeta, ValidationMode } from '../model';
import { ModelValidationResult } from '../model/validationresult';
import { checkIsModelInstance } from '../model';
import { isSet } from '../utils';
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
    regEx?: RegExp;
}

export interface IValidationOptions {
    timeout?: number;
}

export const DEFAULT_FIELD_OPTIONS: IFieldOptions = {
    required: true
};

export const EMAIL_ADDR_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/;

function getOptions(options?: IFieldOptions): IFieldOptions {
    if (isSet(options)) {
        if (typeof options != 'object') {
            throw new Error('FieldError: the options parameter must be an object');
        }
        return options;
    }
    else {
        return Object.assign({}, DEFAULT_FIELD_OPTIONS);
    }
}

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
        this.options = getOptions(options);
        this.validators = [];
        this.asyncValidators = [];
        if (this.options.required || typeof this.options.required == 'undefined') {
            this.validators.push(validators.requiredValidator);
        }
    }

    public validate<T extends IModel>(model: T, meta: IModelMeta<T>, mode: ValidationMode, result: ModelValidationResult, options?: IValidationOptions): Promise<ModelValidationResult> {
        checkIsModelInstance(model);
        return new Promise((resolve, reject) => {
            for (let validator of this.validators) {
                validator(model, this, meta, mode, result, options);
            }
            // TODO: Async validation if sync validation passes
            resolve(result);
        });
    }
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
        v.push(validators.stringValidator);
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
        if (typeof o.regEx == 'object' && o.regEx instanceof RegExp) {
            v.push(validators.regExValidator);
        }
    }
}

export class PasswordField extends TextField {}

export class EmailField extends TextField {
    constructor(name: string, label: string, options?: IFieldOptions) {
        let opts = getOptions(options);
        if (!opts.regEx
            || typeof opts.regEx != 'object'
            || !(opts.regEx instanceof RegExp)) {
            opts.regEx = EMAIL_ADDR_REGEX;
        }
        super(name, label, opts);
    }
}

export class URLField extends TextField {
    constructor(name: string, label: string, options?: IFieldOptions) {
        let opts = getOptions(options);
        if (!opts.regEx
            || typeof opts.regEx != 'object'
            || !(opts.regEx instanceof RegExp)) {
            opts.regEx = URL_REGEX;
        }
        super(name, label, opts);
    }
}

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
