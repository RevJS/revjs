
import { IModel } from '../models/types';
import { ModelOperationResult, IOperationMeta } from './operationresult';
import { ModelManager } from '../models/manager';
import { IModelOperation } from './operation';
import { isSet } from '../utils/index';

export interface IExecOptions {
    // For future use
}

export interface IExecMeta extends IOperationMeta {
    // For future use
}

export interface IExecArgs {
    [key: string]: any;
}

export interface IMethodContext<T> {
    manager: ModelManager;
    args: IExecArgs;
    result: ModelOperationResult<T, IExecMeta>;
    options?: IExecOptions;
}

export const DEFAULT_EXEC_OPTIONS: IExecOptions = {
    // For future use
};

export function exec<R>(manager: ModelManager, model: IModel, method: string, args?: IExecArgs, options?: IExecOptions): Promise<ModelOperationResult<R, IExecMeta>> {
    return new Promise((resolve, reject) => {

        if (typeof model != 'object') {
            throw new Error('Specified model is not a Model instance');
        }
        if (!method || typeof method != 'string') {
            throw new Error('Specified method name is not valid');
        }

        let meta = manager.getModelMeta(model);
        let opts: IExecOptions = Object.assign({}, DEFAULT_EXEC_OPTIONS, options);

        let operation: IModelOperation = {
            operation: method
        };
        let result = new ModelOperationResult<R, IExecMeta>(operation);
        let ctx: IMethodContext<R> = { manager, args, result, options };

        Promise.resolve()  // TODO: improve this...
            .then(() => {
                if (model[method]) {
                    if (typeof model[method] != 'function') {
                        throw new Error(`${model.constructor.name}.${method} is not a function`);
                    }
                    return model[method].call(model, ctx);
                }
                else {
                    let backend = manager.getBackend(meta.backend);
                    return backend.exec(manager, model, method, args, result, opts);
                }
            })
            .then((res) => {
                if (!isSet(res)) {
                    resolve(result);
                }
                else if (!(res instanceof ModelOperationResult)) {
                    result.result = res;
                    resolve(result);
                }
                else {
                    resolve(res);
                }
            })
            .catch((err) => {
                reject(err);
            });

    });

}
