
import { Field, IFieldOptions, getOptions } from './field';
import * as validators from '../validation/validators';

export interface INumberFieldOptions extends IFieldOptions {
    minValue?: number | string;
    maxValue?: number | string;
}

/**
 * A NumberField stores any numeric value supported by JavaScript
 *
 * **Accepted Values:** a *number*
 */
export class NumberField extends Field {
    options: INumberFieldOptions;

    constructor(name: string, options?: INumberFieldOptions) {
        super(name, options);
        this.validators.push(validators.numberValidator);
        if (typeof this.options.minValue != 'undefined') {
            this.validators.push(validators.minValueValidator);
        }
        if (typeof this.options.maxValue != 'undefined') {
            this.validators.push(validators.maxValueValidator);
        }
    }
}

/**
 * A IntegerField stores an integer (whole number) value only. Numbers with
 * decimal values are not allowed.
 *
 * **Accepted Values:** a *number* representing an integer
 */
export class IntegerField extends NumberField {
    constructor(name: string, options?: INumberFieldOptions) {
        super(name, options);
        let validatorIdx = this.options.required ? 2 : 1;
        this.validators.splice(validatorIdx, 0, validators.integerValidator);
    }
}

/**
 * An **AutoNumberField** is a special type of field that generates a sequential
 * numeric value if a value is not provided.
 *
 * This type of field can be used as a unique record identifier, or as a value
 * to be shown to the user (e.g. an Invoice Number field).
 *
 * **Accepted Values:** an *integer* or *undefined*
 */
export class AutoNumberField extends Field {
    options: IFieldOptions;

    constructor(name: string, options?: IFieldOptions) {
        let opts = getOptions(options);
        opts.required = false;
        super(name, opts);
        this.validators.push(validators.numberValidator);
        this.validators.push(validators.integerValidator);
    }
}
