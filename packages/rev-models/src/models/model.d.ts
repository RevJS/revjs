export interface IModelOptions {
    singleton?: boolean;
    storage?: string;
}
export interface IModel {
    [property: string]: any;
}
