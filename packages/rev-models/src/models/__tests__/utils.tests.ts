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

    describe('checkMetadataInitialised()', () => {

        let nonObjMsg = 'MetadataError: Supplied metadata is not an object.';
        let fieldsMissingMsg = 'MetadataError: Supplied metadata does not contain fields array.';
        let notInitedMsg = 'MetadataError: Supplied metadata has not been initialised.';

        it('should not throw if initialised metadata is passed', () => {
            expect(() => {
                checkMetadataInitialised({
                    fields: [],
                    fieldsByName: {}
                });
            }).to.not.throw();
        });

        it('should throw if a non-object is passed', () => {
            expect(() => { checkMetadataInitialised(undefined);
                }).to.throw(nonObjMsg);
            expect(() => { checkMetadataInitialised(null);
                }).to.throw(nonObjMsg);
            expect(() => { checkMetadataInitialised(<any> 22);
                }).to.throw(nonObjMsg);
            expect(() => { checkMetadataInitialised(<any> 'string');
                }).to.throw(nonObjMsg);
        });

        it('should throw if meta.fields is not set or is not an array', () => {
            expect(() => {
                checkMetadataInitialised(<any> {});
            }).to.throw(fieldsMissingMsg);
            expect(() => {
                checkMetadataInitialised({
                    fields: null
                });
            }).to.throw(fieldsMissingMsg);
            expect(() => {
                checkMetadataInitialised({
                    fields: <any> 22
                });
            }).to.throw(fieldsMissingMsg);
            expect(() => {
                checkMetadataInitialised({
                    fields: <any> {}
                });
            }).to.throw(fieldsMissingMsg);
        });

        it('should throw if meta.fieldsByName is not set or is not an object', () => {
            expect(() => {
                checkMetadataInitialised({
                    fields: []
                });
            }).to.throw(notInitedMsg);
            expect(() => {
                checkMetadataInitialised({
                    fields: [],
                    fieldsByName: null
                });
            }).to.throw(notInitedMsg);
            expect(() => {
                checkMetadataInitialised({
                    fields: [],
                    fieldsByName: <any> 22
                });
            }).to.throw(notInitedMsg);
        });

    });
});
