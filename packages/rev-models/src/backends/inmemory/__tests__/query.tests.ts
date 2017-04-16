
import { expect } from 'chai';
import { Model } from '../../../models/model';
import * as d from '../../../decorators';
import { initialiseMeta } from '../../../models/meta';
import { QueryParser } from '../../../queries/queryparser';
import { InMemoryQuery } from '../query';

class TestModel extends Model {
    @d.TextField() name: string;
    @d.IntegerField() score: number;
    @d.DateTimeField() registration_date: Date;
    @d.BooleanField() active: boolean;
}
initialiseMeta(TestModel);

let record1 = {
    name: 'John Doe',
    score: 27,
    registration_date: new Date('2017-03-04'),
    active: true
};

let record2 = {
    name: 'Jane Doe',
    score: 33,
    registration_date: new Date('2016-11-08'),
    active: false
};

let parser: QueryParser;

function getQuery(query: object) {
    return new InMemoryQuery(parser.getQueryNodeForQuery(query, TestModel));
}

describe('InMemoryQuery', () => {

    beforeEach(() => {
        parser = new QueryParser();
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

});
