import { IValidationContext } from '../operations/validate';

export interface IModel {
    [fieldName: string]: any;
    validate?(vc: IValidationContext): void;
    validateAsync?(vc: IValidationContext): Promise<void>;
}

export type ModelCtor = new(...args: any[]) => IModel;
