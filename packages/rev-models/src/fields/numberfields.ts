
import { Field, IFieldOptions, getOptions } from './field';
import * as validators from '../validation/validators';

export interface INumberFieldOptions extends IFieldOptions {
    minValue?: number | string;
    maxValue?: number | string;
}

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

export class IntegerField extends NumberField {
    constructor(name: string, options?: INumberFieldOptions) {
        super(name, options);
        let validatorIdx = this.options.required ? 2 : 1;
        this.validators.splice(validatorIdx, 0, validators.integerValidator);
    }
}

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
