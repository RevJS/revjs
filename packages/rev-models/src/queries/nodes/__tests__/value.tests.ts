import { expect } from 'chai';

import * as d from '../../../decorators';
import { initialiseMeta } from '../../../models/meta';
import { QueryParser } from '../../queryparser';
import { ValueOperator } from '../value';

class TestModel {
    @d.IntegerField()
        id: number;
    @d.TextField()
        name: string;
    @d.BooleanField()
        active: boolean;
}

const meta = initialiseMeta(TestModel);
let parser = new QueryParser();

describe('class ValueOperator<T> - constructor', () => {

    it('throws if value is not a valid field value', () => {
        expect(() => {
            new ValueOperator(parser, '$eq', undefined, meta, null);
        }).to.throw('invalid field value');
        expect(() => {
            new ValueOperator(parser, '$eq', {}, meta, null);
        }).to.throw('invalid field value');
    });

});
