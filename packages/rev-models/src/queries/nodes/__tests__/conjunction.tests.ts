import { expect } from 'chai';

import * as d from '../../../decorators';
import { initialiseMeta } from '../../../models/meta';
import { ConjunctionNode } from '../conjunction';
import { QueryParser } from '../../queryparser';
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

describe('class ConjunctionNode<T> - constructor', () => {

    it('throws if operator is not a conjunction operator', () => {
        expect(() => {
            new ConjunctionNode(parser, '$gt', [], TestModel, null);
        }).to.throw('unrecognised conjunction operator');
    });

    it('throws if value is not an array', () => {
        expect(() => {
            new ConjunctionNode(parser, '$and', {}, TestModel, null);
        }).to.throw('must be an array');
    });

    it('creates a conjunction node with the correct operator', () => {
        let node = new ConjunctionNode(parser, '$and', [], TestModel, null);
        expect(node.operator).to.equal('$and');
    });

    it('creates a conjunction node with no children if value array is empty', () => {
        let node = new ConjunctionNode(parser, '$and', [], TestModel, null);
        expect(node.children).to.have.length(0);
    });

    it('creates a child node for each element in the value array', () => {
        let node = new ConjunctionNode(parser, '$and', [
            { id: 1 },
            { name: 'bob' },
            { active: true, name: 'bob' }
        ], TestModel, null);
        expect(node.children).to.have.length(3);
    });

});
