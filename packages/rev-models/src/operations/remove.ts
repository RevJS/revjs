import { IValidationOptions, modelValidateForRemoval } from './validate';
import { Model } from '../models/model';
import { IWhereQuery } from '../queries/query';
import { ModelOperationResult } from './operationresult';
import { checkMetadataInitialised } from '../models/meta';
import * as backends from '../backends';
import { IModelOperation } from './operation';
import { OPERATION_MESSAGES as msg } from './operationmsg';

export interface IRemoveOptions {
    limit?: number;
    validation?: IValidationOptions;
}

export function modelRemove<T extends Model>(model: T, where?: IWhereQuery, options?: IRemoveOptions): Promise<ModelOperationResult<T>> {
    return new Promise((resolve, reject) => {

        if (!where || typeof where != 'object') {
            throw new Error('remove() must be called with a where clause');
        }

        checkMetadataInitialised(model.constructor);
        let meta = model.getMeta();
        let backend = backends.get(meta.backend);

        if (meta.singleton) {
            throw new Error('remove() cannot be called on singleton models');
        }

        let operation: IModelOperation = {
            operation: 'remove',
            where: where
        };
        let operationResult = new ModelOperationResult<T>(operation);

        modelValidateForRemoval(model, operation, options ? options.validation : null)
            .then((validationResult) => {

                operationResult.validation = validationResult;

                if (validationResult.valid) {
                    backend.remove<T>(model, where, operationResult, options)
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
