import { expect } from 'chai';

import * as v from '../validationresult';

describe('rev.model.ValidationResult', () => {

    describe('constructor()', () => {

        it('sets up an empty result as expected', () => {
            let valid = new v.ModelValidationResult();
            expect(valid.valid).to.equal(true);
            expect(valid.fieldErrors).to.deep.equal({});
            expect(valid.modelErrors).to.deep.equal([]);
            expect(valid.validationFinished).to.equal(true);
        });

        it('creates a valid result when valid is true', () => {
            let valid = new v.ModelValidationResult(true);
            expect(valid.valid).to.equal(true);
        });

        it('creates an invalid result when valid is false', () => {
            let valid = new v.ModelValidationResult(false);
            expect(valid.valid).to.equal(false);
        });

        it('throws an error when valid is not a boolean', () => {
            expect(() => {
                let valid = new v.ModelValidationResult(<any> 'flibble');
            }).to.throw('must be a boolean');
        });

    });

    describe('addFieldError()', () => {

        let valid: v.ModelValidationResult;

        beforeEach(() => {
            valid = new v.ModelValidationResult();
        });

        it('adds a fieldError with no message', () => {
            valid.addFieldError('name');
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: undefined
                }]
            });
        });

        it('adds a fieldError with specified message', () => {
            valid.addFieldError('name', 'That name is too silly!');
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'That name is too silly!'
                }]
            });
        });

        it('adds a fieldError with message and data', () => {
            valid.addFieldError('name', 'fail', {type: 'silly'});
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'fail',
                    type: 'silly'
                }]
            });
        });

        it('adds a separate key for other fields', () => {
            valid.addFieldError('name', 'fail', {type: 'silly'});
            valid.addFieldError('age', 'Old is not an age');
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'fail',
                    type: 'silly'
                }],
                age: [{
                    message: 'Old is not an age'
                }]
            });
        });

        it('adds a second fieldError with no message', () => {
            valid.addFieldError('name', 'Silly!');
            valid.addFieldError('name');
            expect(valid.fieldErrors).to.deep.equal({
                name: [
                    {
                        message: 'Silly!'
                    },
                    {
                        message: undefined
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
            valid.addFieldError('name', 'fail', {type: 'epic'});
            expect(valid.fieldErrors).to.deep.equal({
                name: [
                    {
                        message: 'Silly!'
                    },
                    {
                        message: 'fail',
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
                valid.addFieldError(undefined);
            }).to.throw('You must specify fieldName');
        });

        it('throws an error if data is not an object', () => {
            expect(() => {
                valid.addFieldError('age', 'you are too old', 94);
            }).to.throw('You cannot add non-object data');
        });

    });

    describe('addModelError()', () => {

        let valid: v.ModelValidationResult;

        beforeEach(() => {
            valid = new v.ModelValidationResult();
        });

        it('adds a modelError with specified message', () => {
            valid.addModelError('Model is not cool for cats.');
            expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Model is not cool for cats.'
                }
            ]);
        });

        it('adds a modelError with message and data', () => {
            valid.addModelError('Model is not cool for cats.', {cool: 'dogs'});
            expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Model is not cool for cats.',
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
            valid.addModelError('E-roar', {data: 42});
            expect(valid.modelErrors).to.deep.equal([
                {
                    message: 'Silly model!'
                },
                {
                    message: 'E-roar',
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
                valid.addModelError('You are too old', 94);
            }).to.throw('You cannot add non-object data');
        });

    });

});
