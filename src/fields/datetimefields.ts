
import { Field, IFieldOptions, getOptions } from './field';
import * as validators from './validators';

export class DateField extends Field {
    constructor(name: string, label: string, options?: IFieldOptions) {
        super(name, label, options);
        this.validators.push(validators.dateOnlyValidator);
    }
}

export class TimeField extends Field {
    constructor(name: string, label: string, options?: IFieldOptions) {
        super(name, label, options);
        this.validators.push(validators.timeOnlyValidator);
    }
}

export class DateTimeField extends Field {
    constructor(name: string, label: string, options?: IFieldOptions) {
        super(name, label, options);
        this.validators.push(validators.dateTimeValidator);
    }
}
