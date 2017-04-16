import { expect } from 'chai';

import * as d from '../../../decorators';
import { initialiseMeta } from '../../../models/meta';
import { QueryParser } from '../../queryparser';
import { ValueListOperator } from '../valuelist';
import { Model } from '../../../models/model';

class TestModel extends Model {
    @d.IntegerField()
        id: number;
    @d.TextField()
        name: string;
    @d.BooleanField()
        active: boolean;
}

initialiseMeta(TestModel);

let parser = new QueryParser();

describe('class ValueListOperator<T> - constructor', () => {

    it('throws if operator is not a field operator', () => {
        expect(() => {
            new ValueListOperator(parser, '$and', [], TestModel, null);
        }).to.throw('unrecognised field operator');
    });

    it('throws if value is not an array', () => {
        expect(() => {
            new ValueListOperator(parser, '$in', null, TestModel, null);
        }).to.throw('must be an array');
        expect(() => {
            new ValueListOperator(parser, '$in', {} as any, TestModel, null);
        }).to.throw('must be an array');
    });

    it('throws if an array element is not a field value', () => {
        expect(() => {
            new ValueListOperator(parser, '$in', ['a', new RegExp('a')], TestModel, null);
        }).to.throw('invalid field value');
    });

    it('does not throw if value array is empty', () => {
        expect(() => {
            new ValueListOperator(parser, '$in', [], TestModel, null);
        }).to.not.throw();
    });

    it('stores the operator and values as public properties', () => {
        let valueList = ['a', 'b'];
        let node = new ValueListOperator(parser, '$in', valueList, TestModel, null);
        expect(node.operator).to.equal('$in');
        expect(node.values).to.deep.equal(valueList);
    });

});
