import { ModelValidationResult } from '../validationresult';
import { IModelMeta, initialiseMeta } from '../meta';
import { IModel, ValidationMode } from '../index';
import { expect } from 'chai';
import { registry } from '../../registry';
import * as fld from '../../fields';
import { VALIDATION_MESSAGES as msg } from '../../fields/validationmsg';
import * as sinon from 'sinon';

import * as fn from '../functions';

class TestModel {
    id: number;
    name: string;
    date: Date;
}

describe('rev.model.functions', () => {

    /* for when we need it...
    beforeEach(() => {
        // TODO: do this a better way...
        let reg: any = registry;
        reg.__clearRegistry();
    });
    */

    describe('validateAgainstMeta()', () => {

        let meta: IModelMeta<TestModel> = {
            fields: [
                new fld.IntegerField('id', 'Id', { minValue: 10 }),
                new fld.TextField('name', 'Name'),
                new fld.DateField('date', 'Date', { required: false })
            ],
            validate: <sinon.SinonSpy> null,
            validateAsync: <sinon.SinonStub> null
        };

        initialiseMeta(TestModel, meta);

        it('should return a valid result if valid object is passed', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            return fn.validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    expect(res.valid).to.equal(true);
                });
        });

        it('should return a valid result if valid object is passed and model validators are used', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            meta.validate = sinon.spy();
            meta.validateAsync = sinon.stub().returns(Promise.resolve());

            return fn.validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    expect(res.valid).to.equal(true);
                    expect((<any> meta.validate).callCount).to.equal(1);
                    expect((<any> meta.validateAsync).callCount).to.equal(1);
                });
        });

        it('should reject if a model instance is not passed', () => {
            let test: any = () => {};

            return fn.validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    expect(false, 'Did not reject').to.be.true;
                })
                .catch((err) => {
                    expect(err.message).to.contain('not a model instance');
                });
        });

        it('should return an invalid result if extra fields are present', () => {

            let test = <any> new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();
            test.extra = 'stuff';

            return fn.validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    expect(res.valid).to.equal(false);
                    expect(res.modelErrors.length).to.equal(1);
                    expect(res.modelErrors[0]['message']).to.equal(msg.extra_field('extra'));
                    expect(res.modelErrors[0]['validator']).to.equal('extra_field');
                });
        });

        it('should return an invalid result if a field value is invalid', () => {

            let test = new TestModel();
            test.id = 2;
            test.name = 'Harry';
            test.date = new Date();

            return fn.validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    expect(res.valid).to.equal(false);
                    expect(res.fieldErrors['id'].length).to.equal(1);
                    expect(res.fieldErrors['id'][0]['message']).to.equal(msg.min_value('Id', 10));
                    expect(res.fieldErrors['id'][0]['validator']).to.equal('min_value');
                });
        });

        it('should return an invalid result if a required field is not set', () => {

            let test = new TestModel();
            test.id = 11;

            return fn.validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    expect(res.valid).to.equal(false);
                    expect(res.fieldErrors['name'].length).to.equal(1);
                    expect(res.fieldErrors['name'][0]['message']).to.equal(msg.required('Name'));
                    expect(res.fieldErrors['name'][0]['validator']).to.equal('required');
                });
        });

        it('should return an invalid result if meta validate() fails', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            meta.validate = (model: TestModel, mode: ValidationMode, result: ModelValidationResult) => {
                result.addFieldError('name', 'That name is too stupid!', { stupidityLevel: 10 });
            };

            return fn.validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    meta.validate = undefined;
                    expect(res.valid).to.equal(false);
                    expect(res.fieldErrors['name'].length).to.equal(1);
                    expect(res.fieldErrors['name'][0]['message']).to.equal('That name is too stupid!');
                    expect(res.fieldErrors['name'][0]['stupidityLevel']).to.equal(10);
                });
        });

        it('should return an invalid result if meta validateAsync() fails', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            meta.validateAsync = (model: TestModel, mode: ValidationMode, result: ModelValidationResult) => {
                return new Promise<void>((resolve, reject) => {
                    result.addFieldError('name', 'Google says that name is stupid', { stupidRank: 99 });
                    resolve();
                });
            };

            return fn.validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    meta.validateAsync = undefined;
                    expect(res.valid).to.equal(false);
                    expect(res.fieldErrors['name'].length).to.equal(1);
                    expect(res.fieldErrors['name'][0]['message']).to.equal('Google says that name is stupid');
                    expect(res.fieldErrors['name'][0]['stupidRank']).to.equal(99);
                });
        });

        it('should reject if validation timeout expires', () => {

            let test = new TestModel();
            test.id = 11;
            test.name = 'Harry';
            test.date = new Date();

            meta.validateAsync = (model: TestModel, mode: ValidationMode, result: ModelValidationResult) => {
                return new Promise<void>((resolve, reject) => {
                    setTimeout(() => {
                        resolve();
                    }, 10000)
                });
            };

            return fn.validateAgainstMeta(test, meta, 'create', { timeout: 10})
                .then((res) => {
                    expect(false, 'Did not reject').to.be.true;
                })
                .catch((err) => {
                    expect(err.message).to.contain('timed out');
                });
        });

    });

});
