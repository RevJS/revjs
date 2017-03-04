import { IModelMeta } from '../models/meta';
import { ICreateOptions, IReadOptions, IUpdateOptions, IRemoveOptions } from '../models';
import { ModelOperationResult } from '../models/operations';
import { IModel } from '../models/model';
import { IWhereQuery } from '../operators/operators';
export * from './inmemory';
export interface IStorage {
    create<T extends IModel>(model: T, meta: IModelMeta<T>, result: ModelOperationResult<T>, options: ICreateOptions): Promise<void>;
    update<T extends IModel>(model: T, meta: IModelMeta<T>, where: IWhereQuery, result: ModelOperationResult<T>, options: IUpdateOptions): Promise<void>;
    read<T extends IModel>(model: new () => T, meta: IModelMeta<T>, where: IWhereQuery, result: ModelOperationResult<T>, options: IReadOptions): Promise<void>;
    remove<T extends IModel>(meta: IModelMeta<T>, where: IWhereQuery, result: ModelOperationResult<T>, options: IRemoveOptions): Promise<void>;
}
export declare function get(storageName: string): IStorage;
export declare function configure(storageName: string, storage: IStorage): void;
export declare function getAll(): {
    [storageName: string]: IStorage;
};
export declare function resetStorage(): void;
