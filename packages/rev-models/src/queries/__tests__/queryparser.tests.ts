import { expect } from 'chai';

import * as d from '../../decorators';
import { QueryParser } from '../queryparser';
import { ConjunctionNode } from '../nodes/conjunction';
import { FieldNode } from '../nodes/field';
import { ModelManager } from '../../models/manager';
import { InMemoryBackend } from '../../backends/inmemory/backend';

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

let invalidQueryObjects = [
    null,
    undefined,
    [],
    ['a'],
    new Date(),
];

describe('class QueryParser - constructor', () => {
    let parser: QueryParser;
    let conjunctionOperators = ['$and', '$or'];
    let fieldOperators = ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$like', '$in', '$nin'];

    before(() => {
        parser = new QueryParser(manager);
    });

    describe('constructor()', () => {

        it('registers the default set of conjunction operators', () => {
            expect(Object.keys(parser.CONJUNCTION_OPERATORS)).to.deep.equal(conjunctionOperators);
        });

        it('registers the default set of field operators', () => {
            expect(Object.keys(parser.FIELD_OPERATORS)).to.deep.equal(fieldOperators);
        });

        it('conjunction operator values are constructors', () => {
            for (let op of conjunctionOperators) {
                expect(parser.CONJUNCTION_OPERATORS[op]).to.be.a('function');
            }
        });

        it('field operator values are constructors', () => {
            for (let op of fieldOperators) {
                expect(parser.FIELD_OPERATORS[op]).to.be.a('function');
            }
        });

    });

    describe('getQueryNodeForQuery() - parameters', () => {

        it('throws if an invalid query object is passed', () => {
            for (let val of invalidQueryObjects) {
                expect(() => {
                    parser.getQueryNodeForQuery('wibble' as any, TestModel);
                }, 'value: ' + val).to.throw('is not a query object');
            }
        });

        it('throws if model is not registered', () => {
            expect(() => {
                parser.getQueryNodeForQuery({} as any, { name: 'bob' });
            }).to.throw('is not registered');
        });

        it('does not throw for a valid query', () => {
            expect(() => {
                parser.getQueryNodeForQuery(TestModel, { name: 'bob' });
            }).to.not.throw();
        });

    });

    describe('getQueryNodeForQuery() - single-key objects', () => {

        it('returns a ConjunctionNode($or) if operator is $or', () => {
            let node = parser.getQueryNodeForQuery(TestModel, { $or: [] });
            expect(node).to.be.instanceof(ConjunctionNode);
            expect(node.operator).to.equal('$or');
        });

        it('returns a ConjunctionNode($and) if operator is $and', () => {
            let node = parser.getQueryNodeForQuery(TestModel, { $and: [] });
            expect(node).to.be.instanceof(ConjunctionNode);
            expect(node.operator).to.equal('$and');
        });

        it('returns a FieldNode if key is a field name', () => {
            let node = parser.getQueryNodeForQuery(TestModel, { active: true }) as FieldNode<any>;
            expect(node).to.be.instanceof(FieldNode);
            expect(node.fieldName).to.equal('active');
        });

        it('throws if key is not a field or conjunction operator', () => {
            expect(() => {
                parser.getQueryNodeForQuery(TestModel, { unknown_field: 12 });
            }).to.throw('not a recognised field or conjunction operator');
            expect(() => {
                parser.getQueryNodeForQuery(TestModel, { $lt: 12 });
            }).to.throw('not a recognised field or conjunction operator');
        });

    });

    describe('getQueryNodeForQuery() - multi-key objects', () => {

        let multiKeyTestObjects = [
            { id: 1, $or: [
                { id: 2 },
                { id: 3 }
            ]},
            { id: 2, name: 'bob' },
            { id: 3, name: 'sally', active: true }
        ];

        it('returns a ConjunctionNode($and) for all multi-key objects', () => {
            for (let queryObj of multiKeyTestObjects) {
                let node = parser.getQueryNodeForQuery(TestModel, queryObj);
                let keys = Object.keys(queryObj);
                expect(node).to.be.instanceof(ConjunctionNode);
                expect(node.operator).to.equal('$and');
                expect(node.children).to.have.length(keys.length);
            }
        });

    });

});
