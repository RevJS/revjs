
import { ModelOperationResult } from '../operations/operationresult';
import { IModel, IModelManager, ICreateMeta, ICreateOptions, IUpdateMeta, IUpdateOptions, IRemoveMeta, IRemoveOptions, IReadMeta, IReadOptions, IExecMeta, IExecOptions } from '../models/types';

export interface IBackend {
    create<T extends IModel>(manager: IModelManager, model: T, options: ICreateOptions, result: ModelOperationResult<T, ICreateMeta>): Promise<ModelOperationResult<T, ICreateMeta>>;
    update<T extends IModel>(manager: IModelManager, model: T, options: IUpdateOptions, result: ModelOperationResult<T, IUpdateMeta>): Promise<ModelOperationResult<T, IUpdateMeta>>;
    remove<T extends IModel>(manager: IModelManager, model: T, options: IRemoveOptions, result: ModelOperationResult<T, IRemoveMeta>): Promise<ModelOperationResult<T, IRemoveMeta>>;
    read<T extends IModel>(manager: IModelManager, model: new() => T, options: IReadOptions, result: ModelOperationResult<T, IReadMeta>): Promise<ModelOperationResult<T, IReadMeta>>;
    exec<R>(manager: IModelManager, model: IModel, options: IExecOptions, result: ModelOperationResult<R, IExecMeta>): Promise<ModelOperationResult<R, IExecMeta>>;
}
