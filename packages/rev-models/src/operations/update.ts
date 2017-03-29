import { IValidationOptions, modelValidate } from './validate';
import { Model } from '../models/model';
import { IWhereQuery } from '../queries/query';
import { ModelOperationResult } from './operationresult';
import { checkMetadataInitialised } from '../models/meta';
import * as backends from '../backends';
import { IModelOperation } from './operation';
import { OPERATION_MESSAGES as msg } from './operationmsg';

export interface IUpdateOptions {
    limit?: number;
    validation?: IValidationOptions;
}

export function modelUpdate<T extends Model>(model: T, where?: IWhereQuery, options?: IUpdateOptions): Promise<ModelOperationResult<T>> {
    return new Promise((resolve, reject) => {

        // TODO: Validate 'where' parameter

        let meta = model.getMeta();
        checkMetadataInitialised(meta);
        let backend = backends.get(meta.backend);

        if (!meta.singleton && (!where || typeof where != 'object')) {
            throw new Error('update() must be called with a where clause for non-singleton models');
        }

        let operation: IModelOperation = {
            name: 'update',
            where: where
        };
        let operationResult = new ModelOperationResult<T>(operation);

        modelValidate(model, operation, options ? options.validation : null)
            .then((validationResult) => {

                operationResult.validation = validationResult;

                if (validationResult.valid) {
                    backend.update<typeof model>(model, where, operationResult, options)
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
