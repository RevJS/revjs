
// import ValidationError from '../errors/validation';
import { Field, IValidationOptions } from '../fields';

export interface IModelOptions {
    singleton?: boolean;
    storage?: string;
}

export interface IModelMeta {
    name?: string;
    label?: string;
    fields: Field[];
    singleton?: boolean;
    storage?: string;
}

export interface IModel {
    [property: string]: any;
}

export interface ICreateOptions {
    validation?: IValidationOptions;
}

export interface IReadOptions {
    offset?: number;
    limit?: number;
    fields?: string[];
}

export interface IUpdateOptions {
    validation?: IValidationOptions;
}

export interface IRemoveOptions {
    limit?: number;
}

export function checkIsModelInstance(model: IModel) {
    if (!model || typeof model != 'object' || !model.constructor) {
        throw new Error('ModelError: Supplied model is not a model instance.');
    }
}

export function checkIsModelConstructor(model: Function) {
    if (!model || typeof model != 'function' || !model.name) {
        throw new Error('ModelError: Supplied model is not a model constructor.');
    }
}
