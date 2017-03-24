import { expect } from 'chai';

import * as d from '../../decorators';
import { getQueryNodeForQuery } from '../operators';
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
