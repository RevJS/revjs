import { expect } from 'chai';
import { Model } from '../model';
import * as rewire from 'rewire';
import * as sinon from 'sinon';

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

describe('Model class - operation functions', () => {

    let rwModule = rewire('../model') as any;
    let rwModel = rwModule.Model as new() => Model;

    let functionSpy: sinon.SinonSpy;
    let model: RWTestModel;

    class RWTestModel extends rwModel {}

    beforeEach(() => {
        functionSpy = sinon.stub().returns('test_value');
        rwModule.__set__({
            create_1: { modelCreate: null },
            read_1: { modelRead: null },
            update_1: { modelUpdate: null },
            remove_1: { modelRemove: null },
            validate_1: {
                modelValidate: null,
                modelValidateForRemoval: null
            }
        });
        model = new RWTestModel();
    });

    it('Model.create() calls modelCreate function as expected', () => {
        rwModule.__set__({
            create_1: { modelCreate: functionSpy }
        });
        let testOptions = {};
        let res = model.create(testOptions);
        expect(functionSpy.callCount).to.equal(1);
        expect(functionSpy.getCall(0).args[0]).to.equal(model);
        expect(functionSpy.getCall(0).args[1]).to.equal(testOptions);
        expect(res).to.equal('test_value');
    });

    it('Model.update() calls modelUpdate function as expected', () => {
        rwModule.__set__({
            update_1: { modelUpdate: functionSpy }
        });
        let testWhere = {};
        let testOptions = {};
        let res = model.update(testWhere, testOptions);
        expect(functionSpy.callCount).to.equal(1);
        expect(functionSpy.getCall(0).args[0]).to.equal(model);
        expect(functionSpy.getCall(0).args[1]).to.equal(testWhere);
        expect(functionSpy.getCall(0).args[2]).to.equal(testOptions);
        expect(res).to.equal('test_value');
    });

    it('Model.remove() calls modelRemove function as expected', () => {
        rwModule.__set__({
            remove_1: { modelRemove: functionSpy }
        });
        let testWhere = {};
        let testOptions = {};
        let res = model.remove(testWhere, testOptions);
        expect(functionSpy.callCount).to.equal(1);
        expect(functionSpy.getCall(0).args[0]).to.equal(model);
        expect(functionSpy.getCall(0).args[1]).to.equal(testWhere);
        expect(functionSpy.getCall(0).args[2]).to.equal(testOptions);
        expect(res).to.equal('test_value');
    });

    it('Model.read() calls modelRead function as expected', () => {
        rwModule.__set__({
            read_1: { modelRead: functionSpy }
        });
        let testWhere = {};
        let testOptions = {};
        let res = model.read(testWhere, testOptions);
        expect(functionSpy.callCount).to.equal(1);
        expect(functionSpy.getCall(0).args[0]).to.equal(RWTestModel);
        expect(functionSpy.getCall(0).args[1]).to.equal(testWhere);
        expect(functionSpy.getCall(0).args[2]).to.equal(testOptions);
        expect(res).to.equal('test_value');
    });

    it('Model.validate() calls modelValidate function as expected', () => {
        rwModule.__set__({
            validate_1: { modelValidate: functionSpy }
        });
        let testOperation = {} as any;
        let testOptions = {};
        let res = model.validate(testOperation, testOptions);
        expect(functionSpy.callCount).to.equal(1);
        expect(functionSpy.getCall(0).args[0]).to.equal(model);
        expect(functionSpy.getCall(0).args[1]).to.equal(testOperation);
        expect(functionSpy.getCall(0).args[2]).to.equal(testOptions);
        expect(res).to.equal('test_value');
    });

    it('Model.validateForRemoval() calls modelValidateForRemoval function as expected', () => {
        rwModule.__set__({
            validate_1: { modelValidateForRemoval: functionSpy }
        });
        let testOperation = {} as any;
        let testOptions = {};
        let res = model.validateForRemoval(testOperation, testOptions);
        expect(functionSpy.callCount).to.equal(1);
        expect(functionSpy.getCall(0).args[0]).to.equal(model);
        expect(functionSpy.getCall(0).args[1]).to.equal(testOperation);
        expect(functionSpy.getCall(0).args[2]).to.equal(testOptions);
        expect(res).to.equal('test_value');
    });

});
