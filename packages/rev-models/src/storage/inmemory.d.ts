import { IStorage } from './';
import { IModelMeta } from '../models/meta';
import { IModel, ICreateOptions, IReadOptions, IUpdateOptions, IRemoveOptions } from '../models';
import { ModelOperationResult, ILoadOptions } from '../models/operations';
export declare class InMemoryStorage implements IStorage {
    private storage;
    constructor();
    load<T extends IModel>(data: T[], meta: IModelMeta<T>, result: ModelOperationResult<T>, options?: ILoadOptions): Promise<void>;
    create<T extends IModel>(model: T, meta: IModelMeta<T>, result: ModelOperationResult<T>, options?: ICreateOptions): Promise<void>;
    update<T extends IModel>(model: T, meta: IModelMeta<T>, where: any, result: ModelOperationResult<T>, options?: IUpdateOptions): Promise<void>;
    read<T extends IModel>(model: new () => T, meta: IModelMeta<T>, where: any, result: ModelOperationResult<T>, options?: IReadOptions): Promise<void>;
    remove<T extends IModel>(meta: IModelMeta<T>, where: any, result: ModelOperationResult<T>, options?: IRemoveOptions): Promise<void>;
    private getModelData<T>(model, meta);
    private writeFields<T>(model, meta, target);
}
