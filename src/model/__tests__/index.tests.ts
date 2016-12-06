import { expect } from 'chai';
import { IntegerField, TextField } from '../../fields';

import * as model from '../index';

function getAnyObject() {
    return Object.assign({});
}

describe('rev.model', () => {

    describe('checkIsModelInstance()', () => {

        let errorMessage = 'ModelError: Supplied model is not a model instance.';

        it('should not throw if object is passed', () => {
            expect(() => {
                model.checkIsModelInstance({name: 'Fred'});
            }).to.not.throw();
        });

        it('should throw if a non-object is passed', () => {
            expect(() => { model.checkIsModelInstance(undefined);
                }).to.throw(errorMessage);
            expect(() => { model.checkIsModelInstance(null);
                }).to.throw(errorMessage);
            expect(() => { model.checkIsModelInstance(<any> 22);
                }).to.throw(errorMessage);
            expect(() => { model.checkIsModelInstance(<any> 'string');
                }).to.throw(errorMessage);
            expect(() => { model.checkIsModelInstance(() => {});
                }).to.throw(errorMessage);
        });

    });

    describe('checkIsModelConstructor()', () => {

        let errorMessage = 'ModelError: Supplied model is not a model constructor.';

        it('should not throw if a constructor is passed', () => {
            expect(() => {
                model.checkIsModelConstructor(function MyModel() {});
            }).to.not.throw();
        });

        it('should throw if a non-constructor is passed', () => {
            expect(() => { model.checkIsModelConstructor(undefined);
                }).to.throw(errorMessage);
            expect(() => { model.checkIsModelConstructor(null);
                }).to.throw(errorMessage);
            expect(() => { model.checkIsModelConstructor(<any> 22);
                }).to.throw(errorMessage);
            expect(() => { model.checkIsModelConstructor(<any> 'string');
                }).to.throw(errorMessage);
            expect(() => { model.checkIsModelConstructor(() => {});
                }).to.throw(errorMessage);
            expect(() => { model.checkIsModelConstructor(<any> {name: 'Fred'});
                }).to.throw(errorMessage);
        });

    });

    describe('checkIsModelMetadata()', () => {

        it('throws an error if fields metadata is missing', () => {
            expect(() => { model.checkIsModelMetadata(null);
                }).to.throw('Model metadata must contain a "fields" definition.');
            expect(() => { model.checkIsModelMetadata(<model.IModelMeta<any>> {});
                }).to.throw('Model metadata must contain a "fields" definition.');
        });

        it('throws an error if fields array contains invalid items', () => {
            expect(() => {
                model.checkIsModelMetadata({
                    fields: [
                        new TextField('flibble', 'Jibble'),
                        <IntegerField> getAnyObject()
                    ]
                });
            }).to.throw('is not an instance of rev.Field');
        });

    });

});
