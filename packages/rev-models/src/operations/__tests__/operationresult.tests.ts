
import { expect } from 'chai';
import { IModelOperation } from '../operation';
import { ModelOperationResult } from '../operationresult';
import { IReadMeta } from '../../models/types';

describe('ModelOperationResult - constructor()', () => {

    it('sets up an empty result as expected', () => {
        let op: IModelOperation = {operationName: 'create'};
        let res = new ModelOperationResult(op);
        expect(res.success).to.equal(true);
        expect(res.operation).to.equal(op);
        expect(res.errors).to.be.undefined;
        expect(res.validation).to.be.undefined;
        expect(res.result).to.be.undefined;
        expect(res.results).to.be.undefined;
        expect(res.meta).to.be.undefined;
    });

});

describe('ModelOperationResult - addError()', () => {

    let res: ModelOperationResult<any, any>;

    beforeEach(() => {
        res = new ModelOperationResult({operationName: 'create'});
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

describe('ModelOperationResult - setMeta()', () => {

    let res: ModelOperationResult<any, IReadMeta>;

    beforeEach(() => {
        res = new ModelOperationResult<any, IReadMeta>({operationName: 'read'});
    });

    it('able to add meta when ressult.meta is not defined', () => {
        expect(res.meta).to.be.undefined;
        res.setMeta({ limit: 10 });
        expect(res.meta).to.deep.equal({ limit: 10 });
    });

    it('can add additional keys to existing meta', () => {
        res.setMeta({ limit: 10 });
        expect(res.meta).to.deep.equal({ limit: 10 });
        res.setMeta({ offset: 5 });
        expect(res.meta).to.deep.equal({ limit: 10, offset: 5 });
    });

    it('can set multiple keys', () => {
        res.setMeta({ limit: 10, offset: 20 });
        expect(res.meta).to.deep.equal({ limit: 10, offset: 20 });
    });

    it('keys are merged as expected', () => {
        res.setMeta({ limit: 10, offset: 20 });
        expect(res.meta).to.deep.equal({ limit: 10, offset: 20 });
        res.setMeta({ offset: 0, totalCount: 30 });
        expect(res.meta).to.deep.equal({ limit: 10, offset: 0, totalCount: 30 });
    });

    it('throws if metadata is not an object', () => {
        expect(res.meta).to.be.undefined;
        expect(() => {
            res.setMeta('limit: 10' as any);
        }).to.throw('metadata must be an object');
    });

});
