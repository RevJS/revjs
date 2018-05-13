import { expect } from 'chai';

import { checkIsModelConstructor, checkFieldsList } from '../utils';

describe('rev.model', () => {

    describe('checkIsModelConstructor()', () => {

        let errorMessage = 'ModelError: Supplied model is not a model constructor.';

        it('should not throw if a constructor is passed', () => {
            expect(() => {
                checkIsModelConstructor(class MyModel {});
            }).to.not.throw();
        });

        it('should throw if a non-constructor is passed', () => {
            expect(() => { checkIsModelConstructor(undefined);
                }).to.throw(errorMessage);
            expect(() => { checkIsModelConstructor(null);
                }).to.throw(errorMessage);
            expect(() => { checkIsModelConstructor(22 as any);
                }).to.throw(errorMessage);
            expect(() => { checkIsModelConstructor('string' as any);
                }).to.throw(errorMessage);
            expect(() => { checkIsModelConstructor(function() {} as any);
                }).to.throw(errorMessage);
            expect(() => { checkIsModelConstructor({name: 'Fred'} as any);
                }).to.throw(errorMessage);
        });

    });

    describe('checkFieldsList()', () => {
        const meta = {
            name: 'Bob',
            fieldsByName: { field1: true, field2: true }
        } as any;

        it('throws when fields arg is not set', () => {
            expect(() => {
                checkFieldsList(meta, null as any);
            }).to.throw('"fields" must be an array of field names');
        });

        it('throws when fields arg is not an array', () => {
            expect(() => {
                checkFieldsList(meta, 'field1' as any);
            }).to.throw('"fields" must be an array of field names');
        });

        it('throws when field name is not in meta.fieldsByName', () => {
            expect(() => {
                checkFieldsList(meta, ['field1', 'fieldNOPE']);
            }).to.throw(`Field 'fieldNOPE' does not exist in model Bob`);
        });

        it('does not throw when field list is valid', () => {
            expect(() => {
                checkFieldsList(meta, ['field1', 'field2']);
            }).not.to.throw();
        });

        it('does not throw when field list is empty', () => {
            expect(() => {
                checkFieldsList(meta, []);
            }).not.to.throw();
        });

    });

});
