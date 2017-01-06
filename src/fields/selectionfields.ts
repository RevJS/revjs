
import { Field, IFieldOptions } from './field';
import * as validators from './validators';

export interface ISelectionFieldOptions extends IFieldOptions {
    multiple?: boolean;
}

export class BooleanField extends Field {
    constructor(name: string, label: string, options?: IFieldOptions) {
        super(name, label, options);
        this.validators.push(validators.booleanValidator);
    }
}

export class SelectionField extends Field {
    public options: ISelectionFieldOptions;

    constructor(
            name: string,
            label: string,
            public selection: string[][],
            options?: ISelectionFieldOptions) {
        super(name, label, options);
        if (typeof this.selection != 'object' || !(this.selection instanceof Array)) {
            throw new Error('FieldError: SelectionField "selection" parameter must be an array');
        }
        for (let i=0; i<this.selection.length; i++) {  // tslint:disable-line
            if (typeof this.selection[i] != 'object' || !(this.selection[i] instanceof Array)
                    || this.selection[i].length != 2) {
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
