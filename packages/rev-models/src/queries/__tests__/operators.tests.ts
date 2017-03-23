
import { getQueryObjectOperator } from '../operators';

let query = {
    a: 1,
    b: 2,
    $or: [
        { c: 1}
    ]
};

let parsed = getQueryObjectOperator(null, query);

console.log(parsed);

/*
import { expect } from 'chai';
import {
    validateQuery,
    validateQueryValue,
    validateQueryValueList
} from '../validation';

describe('validateQuery()', () => {

    it('throws if operator is not recognised', () => {
        expect(() => {
            validateQuery('wibble', null);
        }).to.throw('unrecognised operator');
    });

    it('does not throw for valid operator and query', () => {
        expect(() => {
            validateQuery('$gt', 3);
        }).to.not.throw();
    });

});

let validValues = [
    '',
    'aaa',
    12,
    123.456,
    null,
    true,
    false,
    new Date()
];

let invalidValues = [
    new String('test'),  // tslint:disable-line
    new Number(22),   // tslint:disable-line
    undefined,
    { test: 1 },
    [1, 2, 3],
    NaN
];

describe('validateQueryValue()', () => {

    it('does not throw for valid values', () => {
        for (let value of validValues) {
            expect(() => {
                validateQueryValue('$gt', value);
            }).to.not.throw();
        }
    });

    it('throws for invalid values', () => {
        for (let value of invalidValues) {
            expect(() => {
                validateQueryValue('$gt', value);
            }, 'value: ' + value).to.throw('invalid query value');
        }
    });

});

let validValueLists = [
    [null],
    ['aaa', 12],
    [true, false],
    [new Date()],
    new Array<any>('a', 'b', 3)
];

let invalidValueLists = [
    null,
    [],
    { test: 1 },
    new Array()
];

let invalidValueListValues = [
    ['a', undefined, 'b'],
    [11, { test: 2}],
    [NaN]
];

describe('validateQueryValueList()', () => {

    it('does not throw for valid value lists', () => {
        for (let value of validValueLists) {
            expect(() => {
                validateQueryValueList('$gt', value);
            }).to.not.throw();
        }
    });

    it('throws for invalid value lists', () => {
        for (let value of invalidValueLists) {
            expect(() => {
                validateQueryValueList('$in', value);
            }, 'value: ' + value).to.throw('must be an array of values');
        }
    });

    it('throws for invalid values in value lists', () => {
        for (let value of invalidValueListValues) {
            expect(() => {
                validateQueryValueList('$in', value);
            }, 'value: ' + value).to.throw('invalid query value');
        }
    });
});
*/
