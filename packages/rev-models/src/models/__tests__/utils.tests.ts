import { expect } from 'chai';

import { checkIsModelConstructor } from '../utils';

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

});
