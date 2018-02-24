
import { IModelOperationResult } from '../operations/operationresult';
import { IModelValidationResult } from './validationresult';

export class ValidationError extends Error {
    result: IModelOperationResult<any, any>;
    validation: IModelValidationResult;

    constructor(
        validationResult: IModelValidationResult = null,
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
