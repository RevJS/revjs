import { expect } from 'chai';
import * as d from '../../decorators';

import { checkIsValidModelConstructor, checkFieldsList } from '../utils';

describe('rev.model', () => {

    class TestModel {
        @d.AutoNumberField()
            id: number;
        @d.TextField()
            name: string;
        testMethod() {
            // should be sweet
        }
        @d.TextField()
        get calculated() {
            // should also get ignored
            return 'test';
        }
    }

    class TestModelWithConstructorError {
        constructor() {
            throw new Error('Boom!');
        }
    }

    class TestModelWithConstructorValue {
        @d.AutoNumberField()
            id: number;
        @d.TextField()
            name: string = 'test';
    }

    describe('checkIsValidModelConstructor()', () => {

        let errorMessage = 'ModelError: Supplied model is not a model constructor.';

        it('should not throw if a constructor is passed', () => {
            expect(() => {
                checkIsValidModelConstructor(TestModel);
            }).to.not.throw();
        });

        it('should throw if a non-constructor is passed', () => {
            expect(() => { checkIsValidModelConstructor(undefined);
                }).to.throw(errorMessage);
            expect(() => { checkIsValidModelConstructor(null);
                }).to.throw(errorMessage);
            expect(() => { checkIsValidModelConstructor(22 as any);
                }).to.throw(errorMessage);
            expect(() => { checkIsValidModelConstructor('string' as any);
                }).to.throw(errorMessage);
            expect(() => { checkIsValidModelConstructor(function() {} as any);
                }).to.throw(errorMessage);
            expect(() => { checkIsValidModelConstructor({name: 'Fred'} as any);
                }).to.throw(errorMessage);
        });

        it('should throw if calling the constructor with no arguments fails', () => {
            expect(() => {
                checkIsValidModelConstructor(TestModelWithConstructorError);
            }).to.throw('ModelError: constructor threw an error when called with no arguments: Boom!');
        });

        it('should throw if constructor sets initial field values', () => {
            expect(() => {
                checkIsValidModelConstructor(TestModelWithConstructorValue);
            }).to.throw('ModelError: constructor must not set default field values');
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
