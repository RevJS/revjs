
import { Field, IFieldOptions } from './field';
import * as validators from '../validation/validators';

export interface ISelectionFieldOptions extends IFieldOptions {
    selection: string[][];
    multiple?: boolean;
}

export class BooleanField extends Field {
    constructor(name: string, options?: IFieldOptions) {
        super(name, options);
        this.validators.push(validators.booleanValidator);
    }
}

export class SelectionField extends Field {
    options: ISelectionFieldOptions;

    constructor(
            name: string,
            options: ISelectionFieldOptions) {
        super(name, options);
        const selection = this.options.selection;
        if (typeof selection != 'object' || !(selection instanceof Array)) {
            throw new Error('FieldError: SelectionField "selection" option must be set to an array');
        }
        for (let i=0; i<selection.length; i++) {  // tslint:disable-line
            if (typeof selection[i] != 'object' || !(selection[i] instanceof Array)
                    || selection[i].length != 2) {
                throw new Error(`FieldError: SelectionField selection item ${i} should be an array with two items`);
            }
        }
        if (this.options.required) {
            this.validators.push(
                this.options.multiple ?
                    validators.listEmptyValidator :
                    validators.stringEmptyValidator
            );
        }
        this.validators.push(
            this.options.multiple ?
                validators.multipleSelectionValidator :
                validators.singleSelectionValidator
        );
    }
}
