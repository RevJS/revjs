import { expect } from 'chai';

import * as d from '../../../decorators';
import { initialiseMeta } from '../../../models/meta';
import { QueryParser } from '../../queryparser';
import { ValueListOperator } from '../valuelist';

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

describe('class ValueListOperator<T> - constructor', () => {

    it('throws if operator is not a field operator', () => {
        expect(() => {
            new ValueListOperator(parser, '$and', [], meta, null);
        }).to.throw('unrecognised field operator');
    });

    it('throws if value is not an array', () => {
        expect(() => {
            new ValueListOperator(parser, '$in', null, meta, null);
        }).to.throw('must be an array');
        expect(() => {
            new ValueListOperator(parser, '$in', {}, meta, null);
        }).to.throw('must be an array');
    });

    it('throws if an array element is not a field value', () => {
        expect(() => {
            new ValueListOperator(parser, '$in', ['a', new RegExp('a')], meta, null);
        }).to.throw('invalid field value');
    });

    it('does not throw if value array is empty', () => {
        expect(() => {
            new ValueListOperator(parser, '$in', [], meta, null);
        }).to.not.throw();
    });

    it('stores the operator and values as public properties', () => {
        let valueList = ['a', 'b'];
        let node = new ValueListOperator(parser, '$in', valueList, meta, null);
        expect(node.operator).to.equal('$in');
        expect(node.values).to.deep.equal(valueList);
    });

});
