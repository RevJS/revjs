
import { Model } from '../models/model';
import { IValidationOptions, validate } from './validate';
import { ModelOperationResult } from './operationresult';
import { checkMetadataInitialised } from '../models/meta';
import * as backends from '../backends';
import { IModelOperation } from './operation';

export interface ICreateOptions {
    validation?: IValidationOptions;
}

export function create<T extends Model>(model: T, options?: ICreateOptions): Promise<ModelOperationResult<T>> {
    return new Promise((resolve, reject) => {

        checkMetadataInitialised(model.constructor);
        let meta = model.getMeta();
        let backend = backends.get(meta.backend);

        let operation: IModelOperation = {
            operation: 'create'
        };
        let operationResult = new ModelOperationResult<T>(operation);

        validate(model, operation, options ? options.validation : null)
            .then((validationResult) => {

                if (!validationResult.valid) {
                    throw operationResult.createValidationError(validationResult);
                }
                else {
                    operationResult.validation = validationResult;
                }

                return backend.create(model, operationResult, options);

            })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });

}
