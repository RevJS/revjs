
import { Field, IFieldOptions } from './field';
import * as validators from '../validation/validators';

/**
 * A **DateField**, as it's name suggests, holds just a Date value (no time
 * value is stored).
 *
 * **Accepted Values:** a *string* in the format `YYYY-MM-DD`
 */
export class DateField extends Field {
    constructor(name: string, options?: IFieldOptions) {
        super(name, options);
        this.validators.push(validators.dateOnlyValidator);
    }
}

/**
 * A **TimeField**, as it's name suggests, holds just a Time value (no date
 * value is stored).
 *
 * **Accepted Values:** a *string* in the format `HH:MM:SS`
 *
 * **Note:** You will currently need to store any timezone information in a
 * seperate field. Timezone support is a candidate for a future release!
 */
export class TimeField extends Field {
    constructor(name: string, options?: IFieldOptions) {
        super(name, options);
        this.validators.push(validators.timeOnlyValidator);
    }
}

/**
 * A **DateTimeField** stores a full Date and Time value
 *
 * **Accepted Values:** a *string* in the format `YYYY-MM-DDTHH:MM:SS` (e.g.
 * `2018-02-26T08:44:12`)
 *
 * **Note:** You will currently need to store any timezone information in a
 * seperate field. Timezone support is a candidate for a future release!
 */
export class DateTimeField extends Field {
    constructor(name: string, options?: IFieldOptions) {
        super(name, options);
        this.validators.push(validators.dateTimeValidator);
    }
}
