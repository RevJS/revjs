
import { IModel, IModelManager, IExecOptions, IExecMeta, IExecArgs } from '../models/types';
import { ModelOperationResult } from './operationresult';
import { IModelOperation } from './operation';
import { isSet } from '../utils/index';

export interface IMethodContext<T> {
    manager: IModelManager;
    args: IExecArgs;
    result: ModelOperationResult<T, IExecMeta>;
    options?: IExecOptions;
}

export const DEFAULT_EXEC_OPTIONS: IExecOptions = {
    method: null
};

export async function exec<R>(manager: IModelManager, model: IModel, options?: IExecOptions): Promise<ModelOperationResult<R, IExecMeta>> {

    if (typeof model != 'object') {
        throw new Error('Specified model is not a Model instance');
    }
    if (!options.method || typeof options.method != 'string') {
        throw new Error('Specified method name is not valid');
    }

    let meta = manager.getModelMeta(model);
    let opts: IExecOptions = Object.assign({}, DEFAULT_EXEC_OPTIONS, options);

    let operation: IModelOperation = {
        operationName: options.method
    };
    let result = new ModelOperationResult<R, IExecMeta>(operation);
    let ctx: IMethodContext<R> = { manager, args: options.args, result, options };

    let callResult: any;
    if (model[options.method]) {
        if (typeof model[options.method] != 'function') {
            throw new Error(`${model.constructor.name}.${options.method} is not a function`);
        }
        callResult = await model[options.method].call(model, ctx);
    }
    else {
        let backend = manager.getBackend(meta.backend);
        callResult = await backend.exec(manager, model, opts, result);
    }

    if (!isSet(callResult)) {
        return result;
    }
    else if (callResult instanceof ModelOperationResult) {
        return callResult;
    }
    else {
        result.result = callResult;
        return result;
    }

}
