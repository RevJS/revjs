
import { validate } from './validate';
import { IModel, IModelManager, IUpdateOptions, IUpdateMeta } from '../models/types';
import { ModelOperationResult } from './operationresult';
import { IModelOperation } from './operation';
import { getModelPrimaryKeyQuery } from './utils';

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

    if (!opts.where || typeof opts.where != 'object') {
        if (!meta.primaryKey || meta.primaryKey.length == 0) {
            throw new Error('update() must be called with a where clause for models with no primaryKey');
        }
        else {
            opts.where = getModelPrimaryKeyQuery(model, meta);
        }
    }

    if (opts.fields) {
        if (typeof opts.fields != 'object' || !(opts.fields instanceof Array)) {
            throw new Error('update() options.fields must be an array of field names');
        }
        for (let field of opts.fields) {
            if (!(field in meta.fieldsByName)) {
                throw new Error(`update() options.fields error: Field '${field}' does not exist in ${meta.name}`);
            }
        }
    }

    let operation: IModelOperation = {
        operation: 'update',
        where: opts.where
    };
    let operationResult = new ModelOperationResult<T, IUpdateMeta>(operation);

    let validationResult = await validate(manager, model, operation, opts.validation ? opts.validation : null);
    if (!validationResult.valid) {
        throw operationResult.createValidationError(validationResult);
    }
    else {
        operationResult.validation = validationResult;
    }

    return backend.update<typeof model>(manager, model, opts.where, operationResult, opts);
}
