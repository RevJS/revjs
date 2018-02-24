
import { Field, IFieldOptions, getOptions } from './field';
import * as validators from '../validation/validators';

export const EMAIL_ADDR_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/;

export interface ITextFieldBaseOptions extends IFieldOptions {
    minLength?: number;
    maxLength?: number;
    regEx?: RegExp;
}

export interface ITextFieldOptions extends ITextFieldBaseOptions {
    multiLine?: boolean;
}

export class TextFieldBase extends Field {
    options: ITextFieldBaseOptions;

    constructor(name: string, options?: ITextFieldBaseOptions) {
        super(name, options);
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
        if (typeof o.regEx == 'object' && o.regEx instanceof RegExp) {
            v.push(validators.regExValidator);
        }
    }
}

export class TextField extends TextFieldBase {
    options: ITextFieldOptions;
    constructor(name: string, options?: ITextFieldOptions) {
        super(name, options);
    }
}

export class PasswordField extends TextFieldBase {}

export class EmailField extends TextFieldBase {
    constructor(name: string, options?: ITextFieldBaseOptions) {
        let opts = getOptions(options) as ITextFieldBaseOptions;
        if (!opts.regEx
            || typeof opts.regEx != 'object'
            || !(opts.regEx instanceof RegExp)) {
            opts.regEx = EMAIL_ADDR_REGEX;
        }
        super(name, opts);
    }
}

export class URLField extends TextFieldBase {
    constructor(name: string, options?: ITextFieldBaseOptions) {
        let opts = getOptions(options) as ITextFieldBaseOptions;
        if (!opts.regEx
            || typeof opts.regEx != 'object'
            || !(opts.regEx instanceof RegExp)) {
            opts.regEx = URL_REGEX;
        }
        super(name, opts);
    }
}
