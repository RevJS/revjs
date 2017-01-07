import { expect } from 'chai';

import { checkIsModelInstance, checkIsModelConstructor } from '../utils';

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
            expect(() => { checkIsModelInstance(<any> 22);
                }).to.throw(errorMessage);
            expect(() => { checkIsModelInstance(<any> 'string');
                }).to.throw(errorMessage);
            expect(() => { checkIsModelInstance(() => {});
                }).to.throw(errorMessage);
        });

    });

    describe('checkIsModelConstructor()', () => {

        let errorMessage = 'ModelError: Supplied model is not a model constructor.';

        it('should not throw if a constructor is passed', () => {
            expect(() => {
                checkIsModelConstructor(function MyModel() {});
            }).to.not.throw();
        });

        it('should throw if a non-constructor is passed', () => {
            expect(() => { checkIsModelConstructor(undefined);
                }).to.throw(errorMessage);
            expect(() => { checkIsModelConstructor(null);
                }).to.throw(errorMessage);
            expect(() => { checkIsModelConstructor(<any> 22);
                }).to.throw(errorMessage);
            expect(() => { checkIsModelConstructor(<any> 'string');
                }).to.throw(errorMessage);
            expect(() => { checkIsModelConstructor(() => {});
                }).to.throw(errorMessage);
            expect(() => { checkIsModelConstructor(<any> {name: 'Fred'});
                }).to.throw(errorMessage);
        });

    });

});
