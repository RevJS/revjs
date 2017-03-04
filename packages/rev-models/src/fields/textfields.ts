import { Field, IFieldOptions, getOptions } from './field';
import * as validators from './validators';

export const EMAIL_ADDR_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/;

export interface ITextFieldOptions extends IFieldOptions {
    minValue?: number | string;
    maxValue?: number | string;
    minLength?: number;
    maxLength?: number;
    regEx?: RegExp;
}

export class TextField extends Field {
    public options: ITextFieldOptions;

    constructor(name: string, label: string, options?: ITextFieldOptions) {
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
    constructor(name: string, label: string, options?: ITextFieldOptions) {
        let opts = <ITextFieldOptions> getOptions(options);
        if (!opts.regEx
            || typeof opts.regEx != 'object'
            || !(opts.regEx instanceof RegExp)) {
            opts.regEx = EMAIL_ADDR_REGEX;
        }
        super(name, label, opts);
    }
}

export class URLField extends TextField {
    constructor(name: string, label: string, options?: ITextFieldOptions) {
        let opts = <ITextFieldOptions> getOptions(options);
        if (!opts.regEx
            || typeof opts.regEx != 'object'
            || !(opts.regEx instanceof RegExp)) {
            opts.regEx = URL_REGEX;
        }
        super(name, label, opts);
    }
}
