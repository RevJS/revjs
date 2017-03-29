import { expect } from 'chai';

import { checkIsModelInstance, checkIsModelConstructor, checkMetadataInitialised } from '../utils';

describe('rev.model', () => {

    describe('checkIsModelInstance()', () => {

        let errorMessage = 'ModelError: Supplied model is not a model instance.';

        it('should not throw if object is passed', () => {
            expect(() => {
                checkIsModelInstance({name: 'Fred'});
            }).to.not.throw();
        });

        it('should throw if a non-object is passed', () => {
            expect(() => { checkIsModelInstance(undefined);
                }).to.throw(errorMessage);
            expect(() => { checkIsModelInstance(null);
                }).to.throw(errorMessage);
            expect(() => { checkIsModelInstance(22 as any);
                }).to.throw(errorMessage);
            expect(() => { checkIsModelInstance('string' as any);
                }).to.throw(errorMessage);
            expect(() => { checkIsModelInstance(() => {});
                }).to.throw(errorMessage);
        });

    });

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

});
