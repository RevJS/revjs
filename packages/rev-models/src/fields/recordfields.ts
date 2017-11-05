
import { Field, IFieldOptions } from './field';
// import * as validators from '../validation/validators';
import { IModel } from '../models/model';
import { checkIsModelConstructor } from '../models/utils';

export interface IRecordFieldOptions extends IFieldOptions {
    model: IModel;
}

export class RecordField extends Field {
    options: IRecordFieldOptions;

    constructor(
            name: string,
            options: IRecordFieldOptions) {
        super(name, options);

        checkIsModelConstructor(options.model);

        // todo - add model instance validation

    }
}
