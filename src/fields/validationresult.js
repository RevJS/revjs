
export default class ValidationResult {
    constructor(valid, failedValidators) {

        if (!(failedValidators instanceof Array))
            throw new TypeError("failedValidators should be an Array");
        
        this.valid = valid ? true : false;
        this.failedValidators = failedValidators;
    }
}