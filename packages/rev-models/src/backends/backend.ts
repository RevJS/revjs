
import { ModelOperationResult } from '../operations/operationresult';
import { IModel, IModelManager, ICreateMeta, ICreateOptions, IUpdateMeta, IUpdateOptions, IRemoveMeta, IRemoveOptions, IReadMeta, IReadOptions, IExecArgs, IExecMeta, IExecOptions } from '../models/types';

export interface IBackend {
    create<T extends IModel>(manager: IModelManager, model: T, result: ModelOperationResult<T, ICreateMeta>, options: ICreateOptions): Promise<ModelOperationResult<T, ICreateMeta>>;
    update<T extends IModel>(manager: IModelManager, model: T, where: object, result: ModelOperationResult<T, IUpdateMeta>, options: IUpdateOptions): Promise<ModelOperationResult<T, IUpdateMeta>>;
    remove<T extends IModel>(manager: IModelManager, model: T, where: object, result: ModelOperationResult<T, IRemoveMeta>, options: IRemoveOptions): Promise<ModelOperationResult<T, IRemoveMeta>>;
    read<T extends IModel>(manager: IModelManager, model: new() => T, where: object, result: ModelOperationResult<T, IReadMeta>, options: IReadOptions): Promise<ModelOperationResult<T, IReadMeta>>;
    exec<R>(manager: IModelManager, model: IModel, method: string, argObj: IExecArgs, result: ModelOperationResult<R, IExecMeta>, options: IExecOptions): Promise<ModelOperationResult<R, IExecMeta>>;
}
