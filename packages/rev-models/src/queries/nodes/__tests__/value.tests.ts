import { expect } from 'chai';

import * as d from '../../../decorators';
import { QueryParser } from '../../queryparser';
import { ValueOperator } from '../value';
import { Model } from '../../../models/model';
import { ModelRegistry } from '../../../registry/registry';
import { InMemoryBackend } from '../../../backends/inmemory/backend';

class TestModel extends Model {
    @d.IntegerField()
        id: number;
    @d.TextField()
        name: string;
    @d.BooleanField()
        active: boolean;
}

let registry = new ModelRegistry();
registry.registerBackend('default', new InMemoryBackend());
registry.register(TestModel);
let parser = new QueryParser(registry);

describe('class ValueOperator<T> - constructor', () => {

    it('throws if operator is not a field operator', () => {
        expect(() => {
            new ValueOperator(parser, TestModel, '$and', [], null);
        }).to.throw('unrecognised field operator');
    });

    it('throws if value is not a valid field value', () => {
        expect(() => {
            new ValueOperator(parser, TestModel, '$eq', undefined, null);
        }).to.throw('invalid field value');
        expect(() => {
            new ValueOperator(parser, TestModel, '$eq', {}, null);
        }).to.throw('invalid field value');
    });

    it('stores the operator and value as public properties', () => {
        let node = new ValueOperator(parser, TestModel, '$eq', 12, null);
        expect(node.operator).to.equal('$eq');
        expect(node.value).to.equal(12);
    });

});
