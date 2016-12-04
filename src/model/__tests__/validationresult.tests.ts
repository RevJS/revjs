import { expect } from 'chai';

import * as v from '../validationresult';

describe('rev.model.ValidationResult', () => {

    describe('constructor()', () => {

        it('should create a valid result when valid not set', () => {
            let valid = new v.ModelValidationResult();
            expect(valid.valid).to.equal(true);
            expect(valid.fieldErrors).to.deep.equal({});
            expect(valid.modelErrors).to.deep.equal([]);
        });

        it('should create a valid result when valid is true', () => {
            let valid = new v.ModelValidationResult(true);
            expect(valid.valid).to.equal(true);
        });

        it('should create an invalid result when valid is false', () => {
            let valid = new v.ModelValidationResult(false);
            expect(valid.valid).to.equal(false);
        });

        it('should throw an error when valid is not a boolean', () => {
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

        it('should add a fieldError with no message', () => {
            valid.addFieldError('name');
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: undefined
                }]
            });
        });

        it('should add a fieldError with specified message', () => {
            valid.addFieldError('name', 'That name is too silly!');
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'That name is too silly!'
                }]
            });
        });

        it('should add a fieldError with message and data', () => {
            valid.addFieldError('name', 'fail', {type: 'silly'});
            expect(valid.fieldErrors).to.deep.equal({
                name: [{
                    message: 'fail',
                    type: 'silly'
                }]
            });
        });

        it('should add a second fieldError with no message', () => {
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

        it('should add a second fieldError with specified message', () => {
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

        it('should add a second fieldError with message and data', () => {
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

        it('should throw an error when fieldName is not specified', () => {
            expect(() => {
                valid.addFieldError(undefined);
            }).to.throw('You must specify fieldName');
        });

    });

});
