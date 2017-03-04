import { Field, IFieldOptions } from './field';
export interface INumberFieldOptions extends IFieldOptions {
    minValue?: number | string;
    maxValue?: number | string;
}
export declare class NumberField extends Field {
    options: INumberFieldOptions;
    constructor(name: string, label: string, options?: INumberFieldOptions);
}
export declare class IntegerField extends NumberField {
    constructor(name: string, label: string, options?: INumberFieldOptions);
}
