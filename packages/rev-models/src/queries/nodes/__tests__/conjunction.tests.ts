import { expect } from 'chai';

import * as d from '../../../decorators';
import { ConjunctionNode } from '../conjunction';
import { QueryParser } from '../../queryparser';
import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../../../backends/inmemory/backend';

class TestModel {
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

describe('class ConjunctionNode<T> - constructor', () => {

    it('throws if operator is not a conjunction operator', () => {
        expect(() => {
            new ConjunctionNode(parser, TestModel, '$gt', [], null);
        }).to.throw('unrecognised conjunction operator');
    });

    it('throws if value is not an array', () => {
        expect(() => {
            new ConjunctionNode(parser, TestModel, '$and', {}, null);
        }).to.throw('must be an array');
    });

    it('creates a conjunction node with the correct operator', () => {
        let node = new ConjunctionNode(parser, TestModel, '$and', [], null);
        expect(node.operator).to.equal('$and');
    });

    it('creates a conjunction node with no children if value array is empty', () => {
        let node = new ConjunctionNode(parser, TestModel, '$and', [], null);
        expect(node.children).to.have.length(0);
    });

    it('creates a child node for each element in the value array', () => {
        let node = new ConjunctionNode(parser, TestModel, '$and', [
            { id: 1 },
            { name: 'bob' },
            { active: true, name: 'bob' }
        ], null);
        expect(node.children).to.have.length(3);
    });

});
