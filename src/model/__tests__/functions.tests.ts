import { ModelValidationResult } from '../validationresult';
import { IModelMeta } from '../meta';
import { IModel, ValidationMode } from '../index';
import { expect } from 'chai';
import { registry } from '../../registry';
import * as fld from '../../fields';
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

        it('should not throw if valid object is passed', () => {
            let validateFnc = sinon.spy();
            let validateAsyncFnc = sinon.stub().returns(Promise.resolve());

            let meta = {
                fields: [
                    new fld.IntegerField('id', 'Id'),
                    new fld.TextField('name', 'Name'),
                    new fld.DateField('date', 'Date')
                ],
                validate: validateFnc,
                validateAsync: validateAsyncFnc
            };

            let test = new TestModel();
            test.id = 1;
            test.name = 'Harry';
            test.date = new Date();

            return fn.validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    expect(res.valid).to.equal(true);
                });
        });

    });

});
