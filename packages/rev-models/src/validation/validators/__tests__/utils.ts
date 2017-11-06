import { expect } from 'chai';
import { ModelValidationResult } from '../../validationresult';

export function expectValidationFailure(validatorName: string, fieldName: string, message: string, vResult: ModelValidationResult) {
    expect(vResult.valid).to.equal(false);
    expect(vResult.fieldErrors[fieldName].length).to.equal(1);
    expect(vResult.fieldErrors[fieldName][0]).to.deep.equal({
        message: message,
        code: validatorName
    });
}
