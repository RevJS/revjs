
import { ModelOperationResult } from '../operations/operationresult';
import { IModel, IModelManager, ICreateMeta, IUpdateMeta, IRemoveMeta, IReadMeta, IExecMeta, IExecArgs } from '../models/types';
import { IObject } from '../utils/types';

/**
 * Interface that all RevJS backends are required to implement
 */

/** @private */
export interface ICreateParams {
    // Reserved for future use!
}

/** @private */
export interface IUpdateParams {
    where: IObject;
    fields: string[];
}

/** @private */
export interface IRemoveParams {
    where: IObject;
}

/** @private */
export interface IReadParams {
    where: IObject;
    orderBy: string[];
    limit: number;
    offset: number;
    related: string[];
    rawValues: string[];
}

/** @private */
export interface IExecParams {
    method: string;
    args: IExecArgs;
}

export interface IBackend {
    create<T extends IModel>(manager: IModelManager, model: T, params: ICreateParams, result: ModelOperationResult<T, ICreateMeta>): Promise<ModelOperationResult<T, ICreateMeta>>;
    update<T extends IModel>(manager: IModelManager, model: T, params: IUpdateParams, result: ModelOperationResult<T, IUpdateMeta>): Promise<ModelOperationResult<T, IUpdateMeta>>;
    remove<T extends IModel>(manager: IModelManager, model: T, params: IRemoveParams, result: ModelOperationResult<T, IRemoveMeta>): Promise<ModelOperationResult<T, IRemoveMeta>>;
    read<T extends IModel>(manager: IModelManager, model: new() => T, params: IReadParams, result: ModelOperationResult<T, IReadMeta>): Promise<ModelOperationResult<T, IReadMeta>>;
    exec<R>(manager: IModelManager, model: IModel, params: IExecParams, result: ModelOperationResult<R, IExecMeta>): Promise<ModelOperationResult<R, IExecMeta>>;
}
