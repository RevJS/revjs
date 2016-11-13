
export default class ValidationError extends Error {

    constructor(
        public field: string,
        public failedValidators: Array<string> = []) {

        super(`ValidationError: Field '${field}' failed validation. [${failedValidators}]`);

    }
}
