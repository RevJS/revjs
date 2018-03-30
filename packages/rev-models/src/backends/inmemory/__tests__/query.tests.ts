
import { expect } from 'chai';
import * as d from '../../../decorators';
import { QueryParser } from '../../../queries/queryparser';
import { InMemoryQuery } from '../query';
import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../backend';

class TestModel {
    @d.TextField() name: string;
    @d.TextField() job_title: string;
    @d.IntegerField() score: number;
    @d.DateTimeField() registration_date: Date;
    @d.BooleanField() active: boolean;
}

let record1 = {
    name: 'John Doe',
    job_title: '',
    score: 27,
    registration_date: '2017-03-04',
    active: true
};

let record2 = {
    name: 'Jane Doe',
    job_title: 'Registrar',
    score: 33,
    registration_date: '2016-11-08',
    active: false
};

let manager: ModelManager;
let parser: QueryParser;

function getQuery(query: object) {
    return new InMemoryQuery(parser.getQueryNodeForQuery(TestModel, query));
}

describe('InMemoryQuery', () => {

    beforeEach(() => {
        manager = new ModelManager();
        manager.registerBackend('default', new InMemoryBackend());
        manager.register(TestModel);
        parser = new QueryParser(manager);
    });

    describe('Empty query', () => {

        it('returns true for any record when query = {}', () => {
            let query = getQuery({});
            expect(query.testRecord(record1)).to.be.true;
            expect(query.testRecord(record2)).to.be.true;
        });

    });

    describe('Implicit AND', () => {

        it('returns true when one field is queried and matches', () => {
            let query = getQuery({ name: 'John Doe' });
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns false when one field is queried and does not match', () => {
            let query = getQuery({ name: 'Bruce Lee' });
            expect(query.testRecord(record1)).to.be.false;
        });

        it('returns true when two fields are queried and match', () => {
            let query = getQuery({
                name: 'John Doe',
                score: 27
            });
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns false when two fields are queried and one does not match', () => {
            let query = getQuery({
                name: 'Jane Lee',
                score: 27
            });
            expect(query.testRecord(record1)).to.be.false;
        });

        it('returns false when two fields are queried and both do not match', () => {
            let query = getQuery({
                name: 'Jane Lee',
                score: 42
            });
            expect(query.testRecord(record1)).to.be.false;
        });

    });

    describe('Explicit AND', () => {

        it('returns true when one field is queried and matches', () => {
            let query = getQuery({ _and: [{ name: 'John Doe' }]});
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns false when one field is queried and does not match', () => {
            let query = getQuery({ _and: [{ name: 'Bruce Lee' }]});
            expect(query.testRecord(record1)).to.be.false;
        });

        it('returns true when two fields are queried and match', () => {
            let query = getQuery({ _and: [
                { name: { _eq: 'John Doe'}},
                { score: { _eq: 27 }}
            ]});
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns false when two fields are queried and one does not match', () => {
            let query = getQuery({ _and: [
                { name: { _eq: 'Jane Lee' }},
                { score: { _eq: 27 }},
            ]});
            expect(query.testRecord(record1)).to.be.false;
        });

        it('returns false when two fields are queried and both do not match', () => {
            let query = getQuery({ _and: [
                { name: { _eq: 'Jane Lee'}},
                { score: { _eq: 42 }},
            ]});
            expect(query.testRecord(record1)).to.be.false;
        });

    });

    describe('Explcit OR', () => {

        it('returns true when one field is queried and matches', () => {
            let query = getQuery({ _or: [{ name: 'John Doe' }]});
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns false when one field is queried and does not match', () => {
            let query = getQuery({ _or: [{ name: 'Bruce Lee' }]});
            expect(query.testRecord(record1)).to.be.false;
        });

        it('returns true when two fields are queried and match', () => {
            let query = getQuery({ _or: [
                { name: { _eq: 'John Doe'}},
                { score: { _eq: 27 }}
            ]});
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns true when two fields are queried and one does not match', () => {
            let query = getQuery({ _or: [
                { name: { _eq: 'Jane Lee' }},
                { score: { _eq: 27 }},
            ]});
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns false when two fields are queried and both do not match', () => {
            let query = getQuery({ _or: [
                { name: { _eq: 'Jane Lee'}},
                { score: { _eq: 42 }},
            ]});
            expect(query.testRecord(record1)).to.be.false;
        });

    });

    describe('Implicit AND plus Explcit OR', () => {

        it('returns true when one field per conjunction is queried and matches', () => {
            let query = getQuery({
                score: 27,
                _or: [{ active: true }]
            });
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns true when two fields are AND-ed and both match', () => {
            let query = getQuery({
                name: 'John Doe',
                score: 27,
                _or: [{ active: true }]
            });
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns false when two fields are AND-ed and one does not match', () => {
            let query = getQuery({
                name: 'John Doe',
                score: 29,
                _or: [{ active: true }]
            });
            expect(query.testRecord(record1)).to.be.false;
        });

        it('returns true when both OR conditions are matched', () => {
            let query = getQuery({
                name: 'John Doe',
                _or: [
                    { score: 27 },
                    { active: true },
                ]
            });
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns true when one OR condition is matched', () => {
            let query = getQuery({
                name: 'John Doe',
                _or: [
                    { score: 27 },
                    { active: true },
                ]
            });
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns false when neither OR condition is matched', () => {
            let query = getQuery({
                name: 'John Doe',
                _or: [
                    { score: { _lt: 10 }},
                    { score: { _gt: 50 }}
                ]
            });
            expect(query.testRecord(record1)).to.be.false;
        });

    });

    function expectResult(field: string, operator: string, queryValue: any, result: boolean) {
        let queryObj: object = {};
        queryObj[field] = {};
        queryObj[field][operator] = queryValue;
        let query = getQuery(queryObj);
        expect(query.testRecord(record1)).to.equal(result);
    }

    describe('Field operators', () => {

        // TODO: Tests around comparisons with different data types
        // OR: Enforce query value types based on field type (probably better!)

        it('_eq returns true if field is equal to query value', () => {
            expectResult('score', '_eq', 27, true);
        });
        it('_eq returns false if field is not equal to query value', () => {
            expectResult('score', '_eq', 31, false);
        });

        it('_ne returns true if field is not equal to query value', () => {
            expectResult('score', '_ne', 31, true);
        });
        it('_ne returns false if field is equal to query value', () => {
            expectResult('score', '_ne', 27, false);
        });

        it('_gt returns true if field is greater than query value', () => {
            expectResult('score', '_gt', 20, true);
        });
        it('_gt returns false if field is equal to query value', () => {
            expectResult('score', '_gt', 27, false);
        });
        it('_gt returns false if field is less than query value', () => {
            expectResult('score', '_gt', 30, false);
        });

        it('_gte returns true if field is greater than query value', () => {
            expectResult('score', '_gte', 20, true);
        });
        it('_gte returns true if field is equal to query value', () => {
            expectResult('score', '_gte', 27, true);
        });
        it('_gte returns false if field is less than query value', () => {
            expectResult('score', '_gte', 30, false);
        });

        it('_lt returns true if field is less than query value', () => {
            expectResult('score', '_lt', 30, true);
        });
        it('_lt returns false if field is equal to query value', () => {
            expectResult('score', '_lt', 27, false);
        });
        it('_lt returns false if field is greater than query value', () => {
            expectResult('score', '_lt', 20, false);
        });

        it('_lte returns true if field is less than query value', () => {
            expectResult('score', '_lte', 30, true);
        });
        it('_lte returns true if field is equal to query value', () => {
            expectResult('score', '_lte', 27, true);
        });
        it('_lte returns false if field is greater than query value', () => {
            expectResult('score', '_lte', 20, false);
        });

        it('_like returns true when field and query expression are empty', () => {
            expectResult('job_title', '_like', '', true);
        });
        it('_like returns false when field is not empty and query expression is empty', () => {
            expectResult('name', '_like', '', false);
        });
        it('_like matches a partial string with wildcards', () => {
            expectResult('name', '_like', '% %', true);
            expectResult('name', '_like', '%Doe', true);
        });
        it('_like does not match a partial string without wildcards', () => {
            expectResult('name', '_like', ' ', false);
            expectResult('name', '_like', 'Doe', false);
        });
        it('_like with just a wildcard matches anything', () => {
            expectResult('name', '_like', '%', true);
            expectResult('job_title', '_like', '%', true);
        });
        it('_like matches with wildcards in the middle of the query', () => {
            expectResult('name', '_like', '%oh%oe', true);
        });
        it('_like is case-insensitive', () => {
            expectResult('name', '_like', '%dOe', true);
        });
        it('_like allows matches on non-string fields', () => {
            expectResult('registration_date', '_like', '%2017%', true);
        });
        it('_like throws an Error when comparison value is not a string', () => {
            expect(() => {
                expectResult('registration_date', '_like', 27, true);
            }).to.throw('Supplied value is not a string');
        });

        it('_in returns true when field value is in the list', () => {
            expectResult('score', '_in', [26, 27, 28], true);
        });
        it('_in returns false when field value is not in the list', () => {
            expectResult('score', '_in', [46, 47, 48], false);
        });
        it('_in returns false when query value is an empty list', () => {
            expectResult('score', '_in', [], false);
        });

        it('_nin returns true when field value is not in the list', () => {
            expectResult('score', '_nin', [46, 47, 48], true);
        });
        it('_nin returns false when field value is in the list', () => {
            expectResult('score', '_nin', [26, 27, 28], false);
        });
        it('_nin returns true when query value is an empty list', () => {
            expectResult('score', '_nin', [], true);
        });

    });

});
