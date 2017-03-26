import { expect } from 'chai';

import * as d from '../../decorators';
import { initialiseMeta } from '../../models/meta';
import { QueryParser } from '../queryparser';
import { ConjunctionNode } from '../nodes/conjunction';
import { FieldNode } from '../nodes/field';

class TestModel {
    @d.IntegerField()
        id: number;
    @d.TextField()
        name: string;
    @d.BooleanField()
        active: boolean;
}

const meta = initialiseMeta(TestModel);

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
    let fieldOperators = ['$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin'];

    before(() => {
        parser = new QueryParser();
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
                    parser.getQueryNodeForQuery('wibble', meta);
                }, 'value: ' + val).to.throw('is not a query object');
            }
        });

        it('throws if uninitialised metadata is passed', () => {
            expect(() => {
                parser.getQueryNodeForQuery({ name: 'bob' }, {});
            }).to.throw('MetadataError');
        });

        it('does not throw for a valid query', () => {
            expect(() => {
                parser.getQueryNodeForQuery({ name: 'bob' }, meta);
            }).to.not.throw();
        });

    });

    describe('getQueryNodeForQuery() - single-key objects', () => {

        it('returns a ConjunctionNode($or) if operator is $or', () => {
            let node = parser.getQueryNodeForQuery({ $or: [] }, meta);
            expect(node).to.be.instanceof(ConjunctionNode);
            expect(node.operator).to.equal('$or');
        });

        it('returns a ConjunctionNode($and) if operator is $and', () => {
            let node = parser.getQueryNodeForQuery({ $and: [] }, meta);
            expect(node).to.be.instanceof(ConjunctionNode);
            expect(node.operator).to.equal('$and');
        });

        it('returns a FieldNode if key is a field name', () => {
            let node = parser.getQueryNodeForQuery({ active: true }, meta) as FieldNode<any>;
            expect(node).to.be.instanceof(FieldNode);
            expect(node.fieldName).to.equal('active');
        });

        it('throws if key is not a field or conjunction operator', () => {
            expect(() => {
                parser.getQueryNodeForQuery({ unknown_field: 12 }, meta);
            }).to.throw('not a recognised field or conjunction operator');
            expect(() => {
                parser.getQueryNodeForQuery({ $lt: 12 }, meta);
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
                let node = parser.getQueryNodeForQuery(queryObj, meta);
                let keys = Object.keys(queryObj);
                expect(node).to.be.instanceof(ConjunctionNode);
                expect(node.operator).to.equal('$and');
                expect(node.children).to.have.length(keys.length);
            }
        });

    });

});
