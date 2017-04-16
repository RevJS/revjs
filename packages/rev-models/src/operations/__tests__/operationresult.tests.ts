
import { expect } from 'chai';
import { IModelOperation } from '../operation';
import { ModelOperationResult } from '../operationresult';
import { ModelValidationResult } from '../../validation/validationresult';

describe('ModelOperationResult - constructor()', () => {

    it('sets up an empty result as expected', () => {
        let op: IModelOperation = {operation: 'create'};
        let res = new ModelOperationResult(op);
        expect(res.success).to.equal(true);
        expect(res.operation).to.equal(op);
        expect(res.errors).to.be.undefined;
        expect(res.validation).to.be.undefined;
        expect(res.result).to.be.undefined;
        expect(res.results).to.be.undefined;
    });

});

describe('ModelOperationResult - addError()', () => {

    let res: ModelOperationResult<any>;

    beforeEach(() => {
        res = new ModelOperationResult({operation: 'create'});
    });

    it('adds an error with specified message', () => {
        res.addError('The database has exploded!');
        expect(res.errors).to.deep.equal([
            {
                message: 'The database has exploded!'
            }
        ]);
    });

    it('adds an error with message and code', () => {
        res.addError('The database has exploded!', 'db_error');
        expect(res.errors).to.deep.equal([
            {
                message: 'The database has exploded!',
                code: 'db_error'
            }
        ]);
    });

    it('adds an error with message, code and data', () => {
        res.addError('The database has exploded!', 'db_error', {dbms: 'SQL Server'});
        expect(res.errors).to.deep.equal([
            {
                message: 'The database has exploded!',
                code: 'db_error',
                dbms: 'SQL Server'
            }
        ]);
    });

    it('adds a second error with specified message', () => {
        res.addError('Silly operation!');
        res.addError('This function has performed an illegal operation.');
        expect(res.errors).to.deep.equal([
            {
                message: 'Silly operation!'
            },
            {
                message: 'This function has performed an illegal operation.'
            }
        ]);
    });

    it('adds a second modelError with message and data', () => {
        res.addError('Silly operation!');
        res.addError('E-roar', 'oh_no!', {data: 42});
        expect(res.errors).to.deep.equal([
            {
                message: 'Silly operation!'
            },
            {
                message: 'E-roar',
                code: 'oh_no!',
                data: 42
            }
        ]);
    });

    it('sets valid to false when error is added', () => {
        expect(res.success).to.equal(true);
        res.addError('fail!');
        expect(res.success).to.equal(false);
    });

    it('throws an error when no message is specified', () => {
        expect(() => {
            res.addError(undefined);
        }).to.throw('A message must be specified for the operation error');
    });

    it('throws an error if data is not an object', () => {
        expect(() => {
            res.addError('Operation took too long', 'timeout', 1000000);
        }).to.throw('You cannot add non-object data to an operation result');
    });

});

describe('ModelOperationResult - createValidationError()', () => {

    let res: ModelOperationResult<any>;
    let validation: ModelValidationResult;

    beforeEach(() => {
        res = new ModelOperationResult({operation: 'create'});
        validation = new ModelValidationResult();
        validation.addModelError('Its broke bro!');
    });

    it('changes the properties of the operation result as expected', () => {
        expect(res.success).to.be.true;
        expect(res.validation).to.be.undefined;

        res.createValidationError(validation);
        expect(res.success).to.be.false;
        expect(res.errors).to.have.length(1);
        expect(res.errors[0]).to.deep.equal({
            message: 'Model failed validation',
            code: 'validation_error'
        });
        expect(res.validation).to.equal(validation);
    });

    it('returns an Error with the correct properties', () => {
        let result = res.createValidationError(validation);
        expect(result).to.be.instanceof(Error);
        expect(result.message).to.equal('ValidationError');
        expect(result.result).to.equal(res);
    });

});
