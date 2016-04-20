
export default class ValidationError extends Error {
    constructor(field, failedValidators = []) {
        var message = `ValidationError: Field '${field.label || field}' failed validation. [${failedValidators}]`;
        super(message);
        this.field = field;
        this.failedValidators = failedValidators;
    }
}