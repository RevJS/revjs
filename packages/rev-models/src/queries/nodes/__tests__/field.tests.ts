import { expect } from 'chai';

import * as d from '../../../decorators';
import { initialiseMeta } from '../../../models/meta';
import { FieldNode } from '../field';
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

describe('class FieldNode<T> - constructor', () => {

    it('throws if fieldName does not exist in meta', () => {
        expect(() => {
            new FieldNode(parser, 'non_field', null, meta, null);
        }).to.throw('is not a recognised field');
    });

    it('contains a single ValueOperator($eq) if value is a field value', () => {
        let node = new FieldNode(parser, 'name', 'bob', meta, null);
        expect(node.children).to.have.length(1);
        expect(node.children[0]).to.be.instanceof(ValueOperator);
        expect(node.children[0].operator).to.equal('$eq');
    });

    it('throws if value is not a field value or valid query object', () => {
        expect(() => {
            new FieldNode(parser, 'name', undefined, meta, null);
        }).to.throw('invalid field query value for field');
        expect(() => {
            new FieldNode(parser, 'name', {}, meta, null);
        }).to.throw('invalid field query value for field');
    });

    it('throws if field operator is not in parser.FIELD_OPERATORS', () => {
        expect(() => {
            new FieldNode(parser, 'name', { $neq: 'test', $flibble: 2 }, meta, null);
        }).to.throw('unrecognised field operator');
    });

    it('creates a child node for each element in the value array', () => {
        let node = new FieldNode(parser, 'name', {
            $gt: 'aaa',
            $lt: 'zzz',
            $ne: 'jimbob'
        }, meta, null);
        expect(node.children).to.have.length(3);
    });

});
