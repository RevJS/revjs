
import { Field, IFieldOptions, getOptions } from './field';
import * as validators from '../validation/validators';

export const EMAIL_ADDR_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/;

/**
 * @private
 */
export interface ITextFieldBaseOptions extends IFieldOptions {
    minLength?: number;
    maxLength?: number;
    regEx?: RegExp;
}

/**
 * @private
 */
export interface ITextFieldOptions extends ITextFieldBaseOptions {
    multiLine?: boolean;
}

/**
 * @private
 */
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

/**
 * A TextField stores any text value supported by JavaScript
 *
 * **Accepted Values:** a *string*
 */
export class TextField extends TextFieldBase {
    options: ITextFieldOptions;
    constructor(name: string, options?: ITextFieldOptions) {
        super(name, options);
    }
}

/**
 * A PasswordField stores any text value supported by JavaScript
 *
 * **IMPORTANT NOTE:** RevJS does **not** do any encryption of password fields.
 * This field type primarily exists for front-end use.
 *
 * **Accepted Values:** a *string*
 */
export class PasswordField extends TextFieldBase {}

/**
 * An EmailField validates and stores an Email Address.
 *
 * **Accepted Values:** a *string* representing an e-mail address
 */
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

/**
 * A URLField validates and stores a Web Address (URL).
 *
 * **Accepted Values:** a *string* representing a url
 */
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
