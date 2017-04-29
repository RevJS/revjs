import { expect } from 'chai';

import { checkIsModelConstructor } from '../utils';
import { Model } from '../model';

describe('rev.model', () => {

    describe('checkIsModelConstructor()', () => {

        let errorMessage = 'ModelError: Supplied model is not a model constructor.';

        it('should not throw if a constructor is passed', () => {
            expect(() => {
                checkIsModelConstructor(class MyModel extends Model {});
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

        it('should throw if class does not extend Model', () => {
            expect(() => {
                checkIsModelConstructor(class MyModel {});
            }).to.throw('Models must extend the rev-models.Model class');
        });

    });

});
