import { Field, IFieldOptions } from './field';
export interface ISelectionFieldOptions extends IFieldOptions {
    multiple?: boolean;
}
export declare class BooleanField extends Field {
    constructor(name: string, label: string, options?: IFieldOptions);
}
export declare class SelectionField extends Field {
    selection: string[][];
    options: ISelectionFieldOptions;
    constructor(name: string, label: string, selection: string[][], options?: ISelectionFieldOptions);
}
