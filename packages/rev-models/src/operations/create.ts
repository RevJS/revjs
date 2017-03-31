
import { Model } from '../models/model';
import { IValidationOptions, modelValidate } from './validate';
import { ModelOperationResult } from './operationresult';
import { checkMetadataInitialised } from '../models/meta';
import * as backends from '../backends';
import { IModelOperation } from './operation';
import { OPERATION_MESSAGES as msg } from './operationmsg';

export interface ICreateOptions {
    validation?: IValidationOptions;
}

export function modelCreate<T extends Model>(model: T, options?: ICreateOptions): Promise<ModelOperationResult<T>> {
    return new Promise((resolve, reject) => {

        checkMetadataInitialised(model.constructor);
        let meta = model.getMeta();
        let backend = backends.get(meta.backend);

        if (meta.singleton) {
            throw new Error('create() cannot be called on singleton models');
        }

        let operation: IModelOperation = {
            operation: 'create'
        };
        let operationResult = new ModelOperationResult<T>(operation);

        modelValidate(model, operation, options ? options.validation : null)
            .then((validationResult) => {

                operationResult.validation = validationResult;

                if (validationResult.valid) {
                    backend.create<typeof model>(model, operationResult, options)
                        .then(() => {
                            resolve(operationResult);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
                else {
                    operationResult.addError(msg.failed_validation(meta.name), 'failed_validation');
                    resolve(operationResult);
                }

            })
            .catch((err) => {
                reject(err);
            });
    });

}
