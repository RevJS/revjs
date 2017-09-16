
import { Model } from '../models/model';
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

export const DEFAULT_EXEC_OPTIONS: IExecOptions = {
    validate: true
};

export function exec<R>(manager: ModelManager, model: Model, method: string, argObj?: IExecArgs, options?: IExecOptions): Promise<ModelOperationResult<R, IExecMeta>> {
    return new Promise((resolve, reject) => {

        if (typeof model != 'object' || !(model instanceof Model)) {
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
        let operationResult = new ModelOperationResult<R, IExecMeta>(operation);

        let promise = Promise.resolve();

        promise
            .then(() => {
                if (model[method]) {
                    if (typeof model[method] != 'function') {
                        throw new Error(`${model.constructor.name}.${method} is not a function`);
                    }
                    return model[method].call(model, argObj, operationResult);
                }
                else {
                    let backend = manager.getBackend(meta.backend);
                    return backend.exec(manager, model, method, argObj, operationResult, opts);
                }
            })
            .then((res) => {
                if (!isSet(res)) {
                    resolve(operationResult);
                }
                else if (!(res instanceof ModelOperationResult)) {
                    operationResult.result = res;
                    resolve(operationResult);
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
