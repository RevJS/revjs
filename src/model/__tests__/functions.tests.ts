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

        let meta = {
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
                    expect(meta.validate.callCount).to.equal(1);
                    expect(meta.validateAsync.callCount).to.equal(1);
                });
        });

        it('should reject if a model instance is not passed', () => {
            let test = () => {};

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
    });

});
