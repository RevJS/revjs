import { Field, IFieldOptions } from './field';
export declare const EMAIL_ADDR_REGEX: RegExp;
export declare const URL_REGEX: RegExp;
export interface ITextFieldOptions extends IFieldOptions {
    minValue?: number | string;
    maxValue?: number | string;
    minLength?: number;
    maxLength?: number;
    regEx?: RegExp;
}
export declare class TextField extends Field {
    options: ITextFieldOptions;
    constructor(name: string, label: string, options?: ITextFieldOptions);
}
export declare class PasswordField extends TextField {
}
export declare class EmailField extends TextField {
    constructor(name: string, label: string, options?: ITextFieldOptions);
}
export declare class URLField extends TextField {
    constructor(name: string, label: string, options?: ITextFieldOptions);
}
