
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
    registration_date: new Date('2017-03-04'),
    active: true
};

let record2 = {
    name: 'Jane Doe',
    job_title: 'Registrar',
    score: 33,
    registration_date: new Date('2016-11-08'),
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
            let query = getQuery({ $and: [{ name: 'John Doe' }]});
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns false when one field is queried and does not match', () => {
            let query = getQuery({ $and: [{ name: 'Bruce Lee' }]});
            expect(query.testRecord(record1)).to.be.false;
        });

        it('returns true when two fields are queried and match', () => {
            let query = getQuery({ $and: [
                { name: { $eq: 'John Doe'}},
                { score: { $eq: 27 }}
            ]});
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns false when two fields are queried and one does not match', () => {
            let query = getQuery({ $and: [
                { name: { $eq: 'Jane Lee' }},
                { score: { $eq: 27 }},
            ]});
            expect(query.testRecord(record1)).to.be.false;
        });

        it('returns false when two fields are queried and both do not match', () => {
            let query = getQuery({ $and: [
                { name: { $eq: 'Jane Lee'}},
                { score: { $eq: 42 }},
            ]});
            expect(query.testRecord(record1)).to.be.false;
        });

    });

    describe('Explcit OR', () => {

        it('returns true when one field is queried and matches', () => {
            let query = getQuery({ $or: [{ name: 'John Doe' }]});
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns false when one field is queried and does not match', () => {
            let query = getQuery({ $or: [{ name: 'Bruce Lee' }]});
            expect(query.testRecord(record1)).to.be.false;
        });

        it('returns true when two fields are queried and match', () => {
            let query = getQuery({ $or: [
                { name: { $eq: 'John Doe'}},
                { score: { $eq: 27 }}
            ]});
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns true when two fields are queried and one does not match', () => {
            let query = getQuery({ $or: [
                { name: { $eq: 'Jane Lee' }},
                { score: { $eq: 27 }},
            ]});
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns false when two fields are queried and both do not match', () => {
            let query = getQuery({ $or: [
                { name: { $eq: 'Jane Lee'}},
                { score: { $eq: 42 }},
            ]});
            expect(query.testRecord(record1)).to.be.false;
        });

    });

    describe('Implicit AND plus Explcit OR', () => {

        it('returns true when one field per conjunction is queried and matches', () => {
            let query = getQuery({
                score: 27,
                $or: [{ active: true }]
            });
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns true when two fields are AND-ed and both match', () => {
            let query = getQuery({
                name: 'John Doe',
                score: 27,
                $or: [{ active: true }]
            });
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns false when two fields are AND-ed and one does not match', () => {
            let query = getQuery({
                name: 'John Doe',
                score: 29,
                $or: [{ active: true }]
            });
            expect(query.testRecord(record1)).to.be.false;
        });

        it('returns true when both OR conditions are matched', () => {
            let query = getQuery({
                name: 'John Doe',
                $or: [
                    { score: 27 },
                    { active: true },
                ]
            });
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns true when one OR condition is matched', () => {
            let query = getQuery({
                name: 'John Doe',
                $or: [
                    { score: 27 },
                    { active: true },
                ]
            });
            expect(query.testRecord(record1)).to.be.true;
        });

        it('returns false when neither OR condition is matched', () => {
            let query = getQuery({
                name: 'John Doe',
                $or: [
                    { score: { $lt: 10 }},
                    { score: { $gt: 50 }}
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

        it('$eq returns true if field is equal to query value', () => {
            expectResult('score', '$eq', 27, true);
        });
        it('$eq returns false if field is not equal to query value', () => {
            expectResult('score', '$eq', 31, false);
        });

        it('$ne returns true if field is not equal to query value', () => {
            expectResult('score', '$ne', 31, true);
        });
        it('$ne returns false if field is equal to query value', () => {
            expectResult('score', '$ne', 27, false);
        });

        it('$gt returns true if field is greater than query value', () => {
            expectResult('score', '$gt', 20, true);
        });
        it('$gt returns false if field is equal to query value', () => {
            expectResult('score', '$gt', 27, false);
        });
        it('$gt returns false if field is less than query value', () => {
            expectResult('score', '$gt', 30, false);
        });

        it('$gte returns true if field is greater than query value', () => {
            expectResult('score', '$gte', 20, true);
        });
        it('$gte returns true if field is equal to query value', () => {
            expectResult('score', '$gte', 27, true);
        });
        it('$gte returns false if field is less than query value', () => {
            expectResult('score', '$gte', 30, false);
        });

        it('$lt returns true if field is less than query value', () => {
            expectResult('score', '$lt', 30, true);
        });
        it('$lt returns false if field is equal to query value', () => {
            expectResult('score', '$lt', 27, false);
        });
        it('$lt returns false if field is greater than query value', () => {
            expectResult('score', '$lt', 20, false);
        });

        it('$lte returns true if field is less than query value', () => {
            expectResult('score', '$lte', 30, true);
        });
        it('$lte returns true if field is equal to query value', () => {
            expectResult('score', '$lte', 27, true);
        });
        it('$lte returns false if field is greater than query value', () => {
            expectResult('score', '$lte', 20, false);
        });

        it('$like returns true when field and query expression are empty', () => {
            expectResult('job_title', '$like', '', true);
        });
        it('$like returns false when field is not empty and query expression is empty', () => {
            expectResult('name', '$like', '', false);
        });
        it('$like matches a partial string with wildcards', () => {
            expectResult('name', '$like', '% %', true);
            expectResult('name', '$like', '%Doe', true);
        });
        it('$like does not match a partial string without wildcards', () => {
            expectResult('name', '$like', ' ', false);
            expectResult('name', '$like', 'Doe', false);
        });
        it('$like with just a wildcard matches anything', () => {
            expectResult('name', '$like', '%', true);
            expectResult('job_title', '$like', '%', true);
        });
        it('$like matches with wildcards in the middle of the query', () => {
            expectResult('name', '$like', '%oh%oe', true);
        });
        it('$like allows matches on non-string fields', () => {
            // TODO: Formalise how the $like operator should operate on dates
            // I suggest we convert to ISO format instead of the stock Date.toString()
            expectResult('registration_date', '$like', '%2017%', true);
        });
        it('$like throws an Error when comparison value is not a string', () => {
            expect(() => {
                expectResult('registration_date', '$like', 27, true);
            }).to.throw('Supplied value is not a string');
        });

        it('$in returns true when field value is in the list', () => {
            expectResult('score', '$in', [26, 27, 28], true);
        });
        it('$in returns false when field value is not in the list', () => {
            expectResult('score', '$in', [46, 47, 48], false);
        });
        it('$in returns false when query value is an empty list', () => {
            expectResult('score', '$in', [], false);
        });

        it('$nin returns true when field value is not in the list', () => {
            expectResult('score', '$nin', [46, 47, 48], true);
        });
        it('$nin returns false when field value is in the list', () => {
            expectResult('score', '$nin', [26, 27, 28], false);
        });
        it('$nin returns true when query value is an empty list', () => {
            expectResult('score', '$nin', [], true);
        });

    });

});
