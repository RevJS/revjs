import { expect } from 'chai';
import { Model } from '../model';

class EmptyModel extends Model {
}

class TestModel extends Model {
    name: string;
    address: string;
    postcode: string;
}

TestModel.meta = {
    label: 'Test Model'
};

describe('Model class - initial state', () => {

    it('static meta property should have no value on the base class', () => {
        expect(Model.meta).to.be.undefined;
    });

});

describe('Model class - constructor', () => {

    it('should not be possible to instantiate Model instances directly', () => {
        expect(() => {
            new Model();
        }).to.throw('You should not instantiate the Model class directly')
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

describe('Model class - getMeta()', () => {

    it('EmptyModel.getMeta() should be undefined', () => {
        let model = new EmptyModel();
        expect(model.getMeta()).to.be.undefined;
    });

    it('TestModel.getMeta() should be as expected', () => {
        let model = new TestModel();
        expect(model.getMeta()).to.deep.equal({
            label: 'Test Model'
        });
    });

});
