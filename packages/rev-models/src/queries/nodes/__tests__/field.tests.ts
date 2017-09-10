import { expect } from 'chai';

import * as d from '../../../decorators';
import { FieldNode } from '../field';
import { QueryParser } from '../../queryparser';
import { ValueOperator } from '../value';
import { Model } from '../../../models/model';
import { ModelManager } from '../../../registry/registry';
import { InMemoryBackend } from '../../../backends/inmemory/backend';

class TestModel extends Model {
    @d.IntegerField()
        id: number;
    @d.TextField()
        name: string;
    @d.BooleanField()
        active: boolean;
}

let manager = new ModelManager();
manager.registerBackend('default', new InMemoryBackend());
manager.register(TestModel);
let parser = new QueryParser(manager);

describe('class FieldNode<T> - constructor', () => {

    it('throws if fieldName does not exist in meta', () => {
        expect(() => {
            new FieldNode(parser, TestModel, 'non_field', null, null);
        }).to.throw('is not a recognised field');
    });

    it('contains a single ValueOperator($eq) if value is a field value', () => {
        let node = new FieldNode(parser, TestModel, 'name', 'bob', null);
        expect(node.children).to.have.length(1);
        expect(node.children[0]).to.be.instanceof(ValueOperator);
        expect(node.children[0].operator).to.equal('$eq');
    });

    it('throws if value is not a field value or valid query object', () => {
        expect(() => {
            new FieldNode(parser, TestModel, 'name', undefined, null);
        }).to.throw('invalid field query value for field');
        expect(() => {
            new FieldNode(parser, TestModel, 'name', {}, null);
        }).to.throw('invalid field query value for field');
    });

    it('throws if field operator is not in parser.FIELD_OPERATORS', () => {
        expect(() => {
            new FieldNode(parser, TestModel, 'name', { $neq: 'test', $flibble: 2 }, null);
        }).to.throw('unrecognised field operator');
    });

    it('creates a child node for each element in the value array', () => {
        let node = new FieldNode(parser, TestModel, 'name', {
            $gt: 'aaa',
            $lt: 'zzz',
            $ne: 'jimbob'
        }, null);
        expect(node.children).to.have.length(3);
    });

});
