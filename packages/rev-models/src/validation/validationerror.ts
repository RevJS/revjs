
import { IModelOperationResult } from '../operations/operationresult';
import { IModelValidationResult } from './validationresult';

/**
 * A ValidationError is thrown by a [[ModelManager]] when an operation fails
 * due to model validation.
 *
 * The `validation` property contains the failure details in a
 * [[IModelValidationResult]] object.
 *
 * The below example shows an example of handling a ValidationError returned
 * from a ModelManager:
 *
 * ```ts
 * [[include:examples/src/model_manager/handling_validation_errors.ts]]
 * ```
 */
export class ValidationError extends Error {
    /**
     * The result of the model operation (normally failed due to model validation)
     */
    result: IModelOperationResult<any, any>;
    /**
     * The details of the validation problem
     */
    validation: IModelValidationResult | null;

    constructor(
        validationResult: IModelValidationResult | null = null,
        detailsInMessage = true
    ) {
        let message = 'ValidationError';

        if (validationResult && detailsInMessage) {
            for (let fieldName in validationResult.fieldErrors) {
                for (let fieldErr of validationResult.fieldErrors[fieldName]) {
                    message += `\n * ${fieldName}: ${fieldErr.message}`;
                }
            }
            for (let modelErr of validationResult.modelErrors) {
                message += `\n * ${modelErr.message}`;
            }
        }

        super(message);

        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, ValidationError.prototype);

        this.validation = validationResult;
    }

}
