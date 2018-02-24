
import { expect } from 'chai';
import { ValidationError } from '../validationerror';
import { ModelValidationResult } from '../validationresult';

describe('ValidationError', () => {

    it('is a subclass of Error', () => {
        const err = new ValidationError();
        expect(err).to.be.instanceof(Error);
    });

    it('throws with a default "ValidationError" message', () => {
        expect(() => {
            throw new ValidationError();
        }).to.throw('ValidationError');
    });

    describe('when a validation result is provided', () => {
        const validationResult = new ModelValidationResult();
        validationResult.addFieldError('title', 'Title must not include fake news');
        validationResult.addFieldError('field2', 'This field is crook, bro', 'ABC123', { test: 1 });
        validationResult.addModelError('The model is not valid', 'code123', { hmm: true });

        it('includes field errors then model errors in the error message', () => {
            const err = new ValidationError(validationResult);

            expect(err.message).to.equal(`ValidationError
 * title: Title must not include fake news
 * field2: This field is crook, bro
 * The model is not valid`);
        });

        it('exposes a "validation" property with the validation result', () => {
            const err = new ValidationError(validationResult);

            expect(err).to.have.property('validation', validationResult);
        });

        it('does not include errors in the message when detailsInMessage = false', () => {
            const err = new ValidationError(validationResult, false);

            expect(err.message).to.equal('ValidationError');
        });

    });

});