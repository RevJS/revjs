import { expect } from 'chai';
import { registry } from '../../registry';
import * as fld from '../../fields';

import * as fct from '../functions';

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
            let meta = {
                fields: [
                    new fld.IntegerField('id', 'Id'),
                    new fld.TextField('name', 'Name'),
                    new fld.DateField('date', 'Date')
                ]
            };

            let test = new TestModel();
            test.id = 1;
            test.name = 'Harry';
            test.date = new Date();

            return fct.validateAgainstMeta(test, meta, 'create')
                .then((res) => {
                    expect(res).to.equal('It worked!');
                });
        });
        
    });

});
