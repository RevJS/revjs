
import { IModel, ModelManager } from 'rev-models';

import { IBackend } from 'rev-models/lib/backends/backend';
import { ModelOperationResult } from 'rev-models/lib/operations/operationresult';
import { ICreateMeta, ICreateOptions } from 'rev-models/lib/operations/create';
import { IUpdateMeta, IUpdateOptions } from 'rev-models/lib/operations/update';
import { IRemoveMeta, IRemoveOptions } from 'rev-models/lib/operations/remove';
import { IReadMeta, IReadOptions } from 'rev-models/lib/operations/read';
import { IExecArgs, IExecMeta, IExecOptions } from 'rev-models/lib/operations/exec';

export class ModelApiBackend implements IBackend {

    create<T extends IModel>(registry: ModelManager, model: T, result: ModelOperationResult<T, ICreateMeta>, options: ICreateOptions): Promise<ModelOperationResult<T, ICreateMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

    update<T extends IModel>(registry: ModelManager, model: T, where: object, result: ModelOperationResult<T, IUpdateMeta>, options: IUpdateOptions): Promise<ModelOperationResult<T, IUpdateMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

    remove<T extends IModel>(registry: ModelManager, model: T, where: object, result: ModelOperationResult<T, IRemoveMeta>, options: IRemoveOptions): Promise<ModelOperationResult<T, IRemoveMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

    read<T extends IModel>(registry: ModelManager, model: new() => T, where: object, result: ModelOperationResult<T, IReadMeta>, options: IReadOptions): Promise<ModelOperationResult<T, IReadMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

    exec<R>(registry: ModelManager, model: IModel, method: string, argObj: IExecArgs, result: ModelOperationResult<R, IExecMeta>, options: IExecOptions): Promise<ModelOperationResult<R, IExecMeta>> {
        return Promise.reject(new Error('Not yet implemented'));
    }

}
