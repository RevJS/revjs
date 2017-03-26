import { expect } from 'chai';

import * as d from '../../decorators';
import { initialiseMeta } from '../../models/meta';
import { ConjunctionNode } from '../nodes/conjunction';
import { QueryParser } from '../queryparser';

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

describe('class ConjunctionNode<T> - constructor', () => {

    it('throws if operator is not a conjunction operator', () => {
        expect(() => {
            new ConjunctionNode(parser, '$gt', [], meta, null);
        }).to.throw('unrecognised conjunction operator');
    });

    it('throws if value is not an array', () => {
        expect(() => {
            new ConjunctionNode(parser, '$and', {}, meta, null);
        }).to.throw('must be an array');
    });

    it('creates a conjunction node with the correct operator', () => {
        let node = new ConjunctionNode(parser, '$and', [], meta, null);
        expect(node.operator).to.equal('$and');
    });

    it('creates a conjunction node with no children if value array is empty', () => {
        let node = new ConjunctionNode(parser, '$and', [], meta, null);
        expect(node.children).to.have.length(0);
    });

    it('creates a child node for each element in the value array', () => {
        let node = new ConjunctionNode(parser, '$and', [
            { id: 1 },
            { name: 'bob' },
            { active: true, name: 'bob' }
        ], meta, null);
        expect(node.children).to.have.length(3);
    });

});
