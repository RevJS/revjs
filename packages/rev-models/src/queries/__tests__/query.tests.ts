import { expect } from 'chai';
import { isFieldValue, getLikeStrRegExp } from '../query';

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

describe('getLikeStrRegExp()', () => {

    it('returns an empty string matcher for empty strings', () => {
        let r = getLikeStrRegExp('');
        expect(r.toString()).to.equal('/^.{0}$/m');
    });

    it('returns a simple string as an unescaped regex', () => {
        let r = getLikeStrRegExp('i have no special chars');
        expect(r.toString()).to.equal('/^i have no special chars$/m');
    });

    it('escapes special regex characters', () => {
        let r = getLikeStrRegExp('*some* [$pecial] ^{C}harac|ers?');
        expect(r.toString()).to.equal('/^\\*some\\* \\[\\$pecial\\] \\^\\{C\\}harac\\|ers\\?$/m');
    });

    it('replaces single % signs with .*', () => {
        let r = getLikeStrRegExp('%contains % this%');
        expect(r.toString()).to.equal('/^.*contains .* this.*$/m');
    });

    it('replaces double % signs with single %', () => {
        let r = getLikeStrRegExp('we are 99%% sure this will 100%% work');
        expect(r.toString()).to.equal('/^we are 99% sure this will 100% work$/m');
    });

    it('does all of the above things at once', () => {
        let r = getLikeStrRegExp('% con|ain$ 100%% ^awesome!?');
        expect(r.toString()).to.equal('/^.* con\\|ain\\$ 100% \\^awesome!\\?$/m');
    });

    it('throws when value is not a string', () => {
        expect(() => {
            getLikeStrRegExp(null as any);
        }).to.throw('Supplied value is not a string');
    });

});
