import { IModelMeta } from '../models/meta';
import { IModel } from '../models';
export declare class ModelRegistry {
    private _modelProto;
    private _modelMeta;
    constructor();
    isRegistered(modelName: string): boolean;
    register<T extends IModel>(model: new () => T, meta?: IModelMeta<T>): void;
    getModelNames(): string[];
    getProto(modelName: string): Function;
    getMeta(modelName: string): IModelMeta<IModel>;
    clearRegistry(): void;
}
export declare const registry: ModelRegistry;
export declare function register<T extends IModel>(model: new () => T, meta?: IModelMeta<T>): void;
