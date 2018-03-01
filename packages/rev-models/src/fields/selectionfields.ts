
import { Field, IFieldOptions } from './field';
import * as validators from '../validation/validators';

export interface ISelectFieldOptions extends IFieldOptions {
    selection: string[][];
}

/**
 * A BooleanField stores a true / false value
 *
 * **Accepted Values:** a *boolean*
 */
export class BooleanField extends Field {
    constructor(name: string, options?: IFieldOptions) {
        super(name, options);
        this.validators.push(validators.booleanValidator);
    }
}

/**
 * A SelectField stores a single value that must be one of the values in the
 * `selection` list.
 *
 * **Accepted Values:** a *string*
 */
export class SelectField extends Field {
    options: ISelectFieldOptions;

    constructor(
            name: string,
            options: ISelectFieldOptions) {
        super(name, options);
        const selection = this.options.selection;
        if (typeof selection != 'object' || !(selection instanceof Array)) {
            throw new Error('FieldError: SelectField "selection" option must be set to an array');
        }
        for (let i=0; i<selection.length; i++) {  // tslint:disable-line
            if (typeof selection[i] != 'object' || !(selection[i] instanceof Array)
                    || selection[i].length != 2) {
                throw new Error(`FieldError: SelectField selection item ${i} should be an array with two items`);
            }
        }
        if (this.options.required) {
            this.validators.push(validators.stringEmptyValidator);
        }
        this.validators.push(validators.singleSelectionValidator);
    }
}

/**
 * A MultiSelectField stores one or more values, which must be from the
 * specified `selection` list.
 *
 * **Accepted Values:** an *array of strings*
 */
export class MultiSelectField extends Field {
    options: ISelectFieldOptions;

    constructor(
            name: string,
            options: ISelectFieldOptions) {
        super(name, options);
        const selection = this.options.selection;
        if (typeof selection != 'object' || !(selection instanceof Array)) {
            throw new Error('FieldError: MultiSelectField "selection" option must be set to an array');
        }
        for (let i=0; i<selection.length; i++) {  // tslint:disable-line
            if (typeof selection[i] != 'object' || !(selection[i] instanceof Array)
                    || selection[i].length != 2) {
                throw new Error(`FieldError: MultiSelectField selection item ${i} should be an array with two items`);
            }
        }
        if (this.options.required) {
            this.validators.push(validators.listEmptyValidator);
        }
        this.validators.push(validators.multipleSelectionValidator);
    }
}
