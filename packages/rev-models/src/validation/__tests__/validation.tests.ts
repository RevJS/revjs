
import { expect } from 'chai';
import { ModelValidationResult } from '../validationresult';

describe('rev.model.validation', () => {

    describe('ValidationResult - constructor()', () => {

        it('sets up an empty result as expected', () => {
            let valid = new ModelValidationResult();
            expect(valid.valid).to.equal(true);
            expect(valid.fieldErrors).to.deep.equal({});
            expect(valid.modelErrors).to.deep.equal([]);
        });

        it('creates a valid result when valid is true', () => {
            let valid = new ModelValidationResult(true);
            expect(valid.valid).to.equal(true);
        });

        it('creates an invalid result when valid is false', () => {
            let valid = new ModelValidationResult(false);
            expect(valid.valid).to.equal(false);
        });

        it('throws an error when valid is not a boolean', () => {
            expect(() => {
                new ModelValidationResult('flibble' as any);
            }).to.throw('must be a boolean');
        });

    });

    describe('ValidationResult - addFieldError()', () => {

        let valid: ModelValidationResult;

        beforeEach(() => {
            valid = new ModelValidationResult();
        });

        it('adds a fieldError with specified message', () => {
            valid.addFieldError('name', 'That name is too silly!');
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'That name is too silly!'
                }]
            });
        });

        it('adds a fieldError with message and code', () => {
            valid.addFieldError('name', 'fail', 'bugger');
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'fail',
                    code: 'bugger'
                }]
            });
        });

        it('adds a fieldError with message, code and data', () => {
            valid.addFieldError('name', 'fail', 'bugger', {type: 'silly'});
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'fail',
                    code: 'bugger',
                    type: 'silly'
                }]
            });
        });

        it('adds a separate key for other fields', () => {
            valid.addFieldError('name', 'fail', 'bugger', {type: 'silly'});
            valid.addFieldError('age', 'Old is not an age');
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'fail',
                    code: 'bugger',
                    type: 'silly'
                }],
                age: [{
                    message: 'Old is not an age'
                }]
            });
        });

        it('adds a second fieldError with no code', () => {
            valid.addFieldError('name', 'Silly!', 'fail');
            valid.addFieldError('name', 'Silly!');
            expect(valid.fieldErrors).to.deep.equal({
                name: [
                    {
                        message: 'Silly!',
                        code: 'fail'
                    },
                    {
                        message: 'Silly!'
                    }
                ]
            });
        });

        it('adds a second fieldError with specified message', () => {
            valid.addFieldError('name', 'Silly!');
            valid.addFieldError('name', 'Seems like a fake name');
            expect(valid.fieldErrors).to.deep.equal({
                name: [
                    {
                        message: 'Silly!'
                    },
                    {
                        message: 'Seems like a fake name'
                    }
                ]
            });
        });

        it('adds a second fieldError with message and data', () => {
            valid.addFieldError('name', 'Silly!');
            valid.addFieldError('name', 'fail', 'bugger', {type: 'epic'});
            expect(valid.fieldErrors).to.deep.equal({
                name: [
                    {
                        message: 'Silly!'
                    },
                    {
                        message: 'fail',
                        code: 'bugger',
                        type: 'epic'
                    }
                ]
            });
        });

        it('sets valid to false when error is added', () => {
            expect(valid.valid).to.equal(true);
            valid.addFieldError('name', 'fail');
            expect(valid.valid).to.equal(false);
        });

        it('throws an error when fieldName is not specified', () => {
            expect(() => {
                valid.addFieldError(undefined, undefined);
            }).to.throw('You must specify fieldName');
        });

        it('throws an error if data is not an object', () => {
            expect(() => {
                valid.addFieldError('age', 'you are too old', 'fail', 94);
            }).to.throw('You cannot add non-object data');
        });

    });

    describe('ValidationResult - addModelError()', () => {

        let valid: ModelValidationResult;

        beforeEach(() => {
            valid = new ModelValidationResult();
        });

        it('adds a modelError with specified message', () => {
            valid.addModelError('Model is not cool for cats.');
            expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Model is not cool for cats.'
                }
            ]);
        });

        it('adds a modelError with message and code', () => {
            valid.addModelError('Model is not cool for cats.', 'coolness');
            expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Model is not cool for cats.',
                    code: 'coolness'
                }
            ]);
        });

        it('adds a modelError with message, code and data', () => {
            valid.addModelError('Model is not cool for cats.', 'coolness', {cool: 'dogs'});
            expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Model is not cool for cats.',
                    code: 'coolness',
                    cool: 'dogs'
                }
            ]);
        });

        it('adds a second modelError with specified message', () => {
            valid.addModelError('Silly model!');
            valid.addModelError('This model has performed an illegal operation.');
            expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Silly model!'
                },
                {
                    message: 'This model has performed an illegal operation.'
                }
            ]);
        });

        it('adds a second modelError with message and data', () => {
            valid.addModelError('Silly model!');
            valid.addModelError('E-roar', 'oh_no', {data: 42});
            expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Silly model!'
                },
                {
                    message: 'E-roar',
                    code: 'oh_no',
                    data: 42
                }
            ]);
        });

        it('sets valid to false when error is added', () => {
            expect(valid.valid).to.equal(true);
            valid.addModelError('fail!');
            expect(valid.valid).to.equal(false);
        });

        it('throws an error when no message is specified', () => {
            expect(() => {
                valid.addModelError(undefined);
            }).to.throw('You must specify a message for a model error');
        });

        it('throws an error if data is not an object', () => {
            expect(() => {
                valid.addModelError('You are too old', 'age', 94);
            }).to.throw('You cannot add non-object data');
        });

    });

});
