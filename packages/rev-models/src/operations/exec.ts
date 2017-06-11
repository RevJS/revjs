
import { Model } from '../models/model';
import { IValidationOptions } from './validate';
import { ModelOperationResult, IOperationMeta } from './operationresult';
import { ModelRegistry } from '../registry/registry';

export interface IExecOptions {
    validation?: IValidationOptions;
}

export interface IExecMeta extends IOperationMeta {
    // For future use
}

export const DEFAULT_EXEC_OPTIONS: IExecOptions = {};

export function exec<T extends Model>(registry: ModelRegistry, model: T, method: string, args: any[], options?: IExecOptions): Promise<ModelOperationResult<T, IExecMeta>> {
    return new Promise((resolve, reject) => {

        if (typeof model != 'object' || !(model instanceof Model)) {
            throw new Error('Specified model is not an instance of Model');
        }
        if (!method || typeof method != 'string') {
            throw new Error('Specified method name is not valid');
        }

        let callArgs = [];
        if (args) {
            if (!(args instanceof Array)) {
                throw new Error('Specified args must be an array of values');
            }
            callArgs = args;
        }

        if (model[method]) {
            if (typeof model[method] != 'function') {
                throw new Error(`${model.constructor.name}.${method} is not a function`);
            }
            model[method].apply(model, callArgs);
            /* TODO: Validation
            validate(registry, model, operation, opts.validation ? opts.validation : null)
                .then((validationResult) => {
            */
        }
        else {
            /* TODO: Pass off to backend
            let backend = registry.getBackend(meta.backend);
            backend.exec(registry, model, operationResult, opts);
            */
        }

    });

}
