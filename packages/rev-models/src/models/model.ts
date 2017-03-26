
export interface IModelOptions {
    singleton?: boolean;
    backend?: string;
}

export interface IModel {
    [property: string]: any;
}
