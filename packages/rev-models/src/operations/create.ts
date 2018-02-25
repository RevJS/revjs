
import { IModel, IModelManager, ICreateOptions, ICreateMeta } from '../models/types';
import { validate } from './validate';
import { ModelOperationResult } from './operationresult';
import { IModelOperation } from './operation';
import { ValidationError } from '../validation/validationerror';

/**
 * @private
 */
export const DEFAULT_CREATE_OPTIONS: ICreateOptions = {};

/**
 * @private
 * Documentation in ModelManager class
 */
export async function create<T extends IModel>(manager: IModelManager, model: T, options?: ICreateOptions): Promise<ModelOperationResult<T, ICreateMeta>> {

    if (typeof model != 'object') {
        throw new Error('Specified model is not a Model instance');
    }

    let meta = manager.getModelMeta(model);
    if (!meta.stored) {
        throw new Error('Cannot call create() on models with stored: false');
    }

    let backend = manager.getBackend(meta.backend);

    let operation: IModelOperation = {
        operationName: 'create'
    };
    let operationResult = new ModelOperationResult<T, ICreateMeta>(operation);
    let opts = Object.assign({}, DEFAULT_CREATE_OPTIONS, options);

    let validationResult = await validate(manager, model, operation, opts.validation ? opts.validation : null);

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

    return backend.create(manager, model, opts, operationResult);

}
