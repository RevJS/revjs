import { expect } from 'chai';

import * as d from '../../decorators';
import { getQueryObjectOperator } from '../operators';
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

describe('getQueryObjectOperator() - parameters', () => {

    it('throws if an invalid query object is passed', () => {
        for (let val of invalidQueryObjects) {
            expect(() => {
                getQueryObjectOperator('wibble', meta);
            }, 'value: ' + val).to.throw('is not a query object');
        }
    });

    it('throws if uninitialised metadata is passed', () => {
        expect(() => {
            getQueryObjectOperator({ name: 'bob' }, {});
        }).to.throw('MetadataError');
    });

    it('does not throw for a valid query', () => {
        expect(() => {
            getQueryObjectOperator({ name: 'bob' }, meta);
        }).to.not.throw();
    });

});
