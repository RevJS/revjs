import { expect } from 'chai';
import { isFieldValue } from '../query';

let validFieldValues = [
    12,
    12.34,
    'aaa',
    true,
    false,
    new Date(),
    null
];

let invalidFieldValues = [
    undefined,
    NaN,
    new RegExp('a/g'),
    { test: 1 }
];

describe('isFieldValue()', () => {

    it('returns true for valid field values', () => {
        for (let value of validFieldValues) {
            expect(isFieldValue(value), 'value: ' + value).to.be.true;
        }
    });

    it('returns false for invalid (non) field values', () => {
        for (let value of invalidFieldValues) {
            expect(isFieldValue(value), 'value: ' + value).to.be.false;
        }
    });

});
