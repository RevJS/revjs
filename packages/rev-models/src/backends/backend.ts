
import { ModelOperationResult } from '../operations/operationresult';
import { Model } from '../models/model';
import { ICreateOptions, ICreateMeta } from '../operations/create';
import { IUpdateOptions, IUpdateMeta } from '../operations/update';
import { IReadOptions, IReadMeta } from '../operations/read';
import { IRemoveOptions, IRemoveMeta } from '../operations/remove';
import { ModelManager } from '../registry/registry';
import { IExecArgs, IExecOptions, IExecMeta } from '../operations/exec';

export interface IBackend {
    create<T extends Model>(manager: ModelManager, model: T, result: ModelOperationResult<T, ICreateMeta>, options: ICreateOptions): Promise<ModelOperationResult<T, ICreateMeta>>;
    update<T extends Model>(manager: ModelManager, model: T, where: object, result: ModelOperationResult<T, IUpdateMeta>, options: IUpdateOptions): Promise<ModelOperationResult<T, IUpdateMeta>>;
    remove<T extends Model>(manager: ModelManager, model: T, where: object, result: ModelOperationResult<T, IRemoveMeta>, options: IRemoveOptions): Promise<ModelOperationResult<T, IRemoveMeta>>;
    read<T extends Model>(manager: ModelManager, model: new() => T, where: object, result: ModelOperationResult<T, IReadMeta>, options: IReadOptions): Promise<ModelOperationResult<T, IReadMeta>>;
    exec<R>(manager: ModelManager, model: Model, method: string, argObj: IExecArgs, result: ModelOperationResult<R, IExecMeta>, options: IExecOptions): Promise<ModelOperationResult<R, IExecMeta>>;
}
