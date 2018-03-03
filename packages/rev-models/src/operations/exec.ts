
import { IModel, IModelManager, IExecOptions, IExecMeta, IExecArgs } from '../models/types';
import { ModelOperationResult } from './operationresult';
import { IModelOperation } from './operation';
import { isSet } from '../utils/index';

/**
 * The IMethodContext interface represents the object passed to model methods,
 * when executed via [[ModelManager.exec]]
 */
export interface IMethodContext<T> {
    /**
     * The associated ModelManager
     */
    manager: IModelManager;
    /**
     * The arguments passed to the [[ModelManager.exec]] method
     */
    args: IExecArgs;
    /**
     * The result of the operation
     */
    result: ModelOperationResult<T, IExecMeta>;
    /**
     * The original options passed to [[ModelManager.exec]]
     */
    options?: IExecOptions;
}

/**
 * @private
 */
export const DEFAULT_EXEC_OPTIONS: IExecOptions = {
    method: null
};

/**
 * @private
 * Documentation in ModelManager class
 */
export async function exec<R>(manager: IModelManager, model: IModel, options: IExecOptions): Promise<ModelOperationResult<R, IExecMeta>> {

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
