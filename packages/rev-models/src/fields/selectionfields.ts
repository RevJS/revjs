
import { Field, IFieldOptions } from './field';
import * as validators from '../validation/validators';

export interface ISelectFieldOptions extends IFieldOptions {
    selection: string[][];
}

export class BooleanField extends Field {
    constructor(name: string, options?: IFieldOptions) {
        super(name, options);
        this.validators.push(validators.booleanValidator);
    }
}

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
