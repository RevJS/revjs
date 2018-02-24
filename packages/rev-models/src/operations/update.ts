
import { validate } from './validate';
import { IModel, IModelManager, IUpdateOptions, IUpdateMeta } from '../models/types';
import { ModelOperationResult } from './operationresult';
import { IModelOperation } from './operation';
import { getModelPrimaryKeyQuery } from './utils';
import { checkFieldsList } from '../models/utils';
import { ValidationError } from '../validation/validationerror';

export const DEFAULT_UPDATE_OPTIONS: IUpdateOptions = {};

export async function update<T extends IModel>(manager: IModelManager, model: T, options?: IUpdateOptions): Promise<ModelOperationResult<T, IUpdateMeta>> {

    if (typeof model != 'object') {
        throw new Error('Specified model is not a Model instance');
    }

    let meta = manager.getModelMeta(model);
    if (!meta.stored) {
        throw new Error('Cannot call update() on models with stored: false');
    }

    let backend = manager.getBackend(meta.backend);
    let opts: IUpdateOptions = Object.assign({}, DEFAULT_UPDATE_OPTIONS, options);
    let validationOpts = opts.validation || {};

    if (!opts.where || typeof opts.where != 'object') {
        if (!meta.primaryKey || meta.primaryKey.length == 0) {
            throw new Error('update() must be called with a where clause for models with no primaryKey');
        }
        else {
            opts.where = getModelPrimaryKeyQuery(model, meta);
        }
    }

    if (opts.fields) {
        checkFieldsList(meta, opts.fields);
    }
    else {
        opts.fields = [];
        meta.fields.forEach((field) => {
            if (typeof model[field.name] != 'undefined') {
                opts.fields.push(field.name);
            }
        });
    }
    validationOpts.fields = opts.fields;

    let operation: IModelOperation = {
        operationName: 'update',
        where: opts.where
    };
    let operationResult = new ModelOperationResult<T, IUpdateMeta>(operation);

    let validationResult = await validate(manager, model, operation, validationOpts);
    if (!validationResult.valid) {
        operationResult.addError('Model failed validation', 'validation_error');
        operationResult.validation = validationResult;
        const error = new ValidationError(validationResult);
        error.result = operationResult;
        throw error;
    }
    else {
        operationResult.validation = validationResult;
    }

    return backend.update<typeof model>(manager, model, opts, operationResult);
}
