import { expect } from 'chai';

import * as d from '../../decorators';
import { getQueryNodeForQuery, ConjunctionNode, FieldNode } from '../operators';
import { initialiseMeta } from '../../models/meta';

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

describe('getQueryNodeForQuery() - parameters', () => {

    it('throws if an invalid query object is passed', () => {
        for (let val of invalidQueryObjects) {
            expect(() => {
                getQueryNodeForQuery('wibble', meta);
            }, 'value: ' + val).to.throw('is not a query object');
        }
    });

    it('throws if uninitialised metadata is passed', () => {
        expect(() => {
            getQueryNodeForQuery({ name: 'bob' }, {});
        }).to.throw('MetadataError');
    });

    it('does not throw for a valid query', () => {
        expect(() => {
            getQueryNodeForQuery({ name: 'bob' }, meta);
        }).to.not.throw();
    });

});

describe('getQueryNodeForQuery() - single-key objects', () => {

    it('returns a ConjunctionNode($or) if operator is $or', () => {
        let node = getQueryNodeForQuery({ $or: [] }, meta);
        expect(node).to.be.instanceof(ConjunctionNode);
        expect(node.operator).to.equal('$or');
    });

    it('returns a ConjunctionNode($and) if operator is $and', () => {
        let node = getQueryNodeForQuery({ $and: [] }, meta);
        expect(node).to.be.instanceof(ConjunctionNode);
        expect(node.operator).to.equal('$and');
    });

    it('returns a FieldNode if key is a field name', () => {
        let node = getQueryNodeForQuery({ active: true }, meta) as FieldNode<any>;
        expect(node).to.be.instanceof(FieldNode);
        expect(node.fieldName).to.equal('active');
    });

    it('throws if key is not a field or conjunction operator', () => {
        expect(() => {
            getQueryNodeForQuery({ unknown_field: 12 }, meta);
        }).to.throw('not a recognised field or conjunction operator');
        expect(() => {
            getQueryNodeForQuery({ $lt: 12 }, meta);
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
            let node = getQueryNodeForQuery(queryObj, meta);
            let keys = Object.keys(queryObj);
            expect(node).to.be.instanceof(ConjunctionNode);
            expect(node.operator).to.equal('$and');
            expect(node.children).to.have.length(keys.length);
        }
    });

});
