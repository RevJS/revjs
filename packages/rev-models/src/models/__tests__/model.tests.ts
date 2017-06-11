import { expect } from 'chai';
import { Model } from '../model';
import { IValidationContext } from '../../operations/validate';
import { ModelValidationResult } from '../../validation/validationresult';

class EmptyModel extends Model {
}

class TestModel extends Model {
    name: string;
    address: string;
    postcode: string;
}

describe('Model class - constructor', () => {

    describe('constructor()', () => {

        it('should not be possible to instantiate Model instances directly', () => {
            expect(() => {
                new Model();
            }).to.throw('You should not instantiate the Model class directly');
        });

        it('should create a new model with no properties', () => {
            let model = new EmptyModel();
            expect(Object.keys(model)).to.deep.equal([]);
        });

        it('should create a new model with keys as expected', () => {
            let model = new TestModel();
            model.name = 'bob';
            expect(Object.keys(model)).to.deep.equal(['name']);
        });

        it('should throw if invalid initial data is passed', () => {
            expect(() => {
                new TestModel('bob' as any);
            }).to.throw('initial data must be an object');
        });

        it('should assign object data to properties', () => {
            let data = {
                name: 'bob',
                address: '123 test street',
                postcode: '1234'
            };
            let model = new TestModel(data);
            expect(Object.keys(model)).to.deep.equal(['name', 'address', 'postcode']);
            expect(model.name).to.equal(data.name);
            expect(model.address).to.equal(data.address);
            expect(model.postcode).to.equal(data.postcode);
        });

    });

    describe('validate()', () => {
        let validationContext: IValidationContext;

        beforeEach(() => {
            validationContext = {
                operation: { operation: 'create' },
                result: new ModelValidationResult()
            };
        });

        it('Model class should define a validate() method', () => {
            let test = new TestModel();
            expect(test.validate).to.be.a('function');
        });

        it('validate() should not return a value', () => {
            let test = new TestModel();
            expect(test.validate(validationContext)).to.be.undefined;
        });

        it('validation context result should be true', () => {
            let test = new TestModel();
            test.validate(validationContext);
            expect(validationContext.result.valid).to.be.true;
        });

    });

    describe('validateAsync()', () => {
        let validationContext: IValidationContext;

        beforeEach(() => {
            validationContext = {
                operation: { operation: 'create' },
                result: new ModelValidationResult()
            };
        });

        it('Model class should define a validateAsync() method', () => {
            let test = new TestModel();
            expect(test.validateAsync).to.be.a('function');
        });

        it('validateAsync() should return a promise', () => {
            let test = new TestModel();
            expect(test.validateAsync(validationContext)).to.be.instanceof(Promise);
        });

        it('validateAsync() should not resolve to a value', () => {
            let test = new TestModel();
            expect(test.validateAsync(validationContext)).to.eventually.equal(undefined);
        });

        it('validation context result should be true', () => {
            let test = new TestModel();
            return test.validateAsync(validationContext)
                .then(() => {
                    expect(validationContext.result.valid).to.be.true;
                });
        });

    });

});
