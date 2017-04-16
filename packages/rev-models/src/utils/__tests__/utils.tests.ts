
import { expect } from 'chai';
import { isSet, printObj, escapeForRegex } from '../index';

describe('isSet()', () => {

    it('returns false if value is not set', () => {
        expect(isSet(undefined)).to.be.false;
        expect(isSet(null)).to.be.false;
    });

    it('returns true if value is set', () => {
        expect(isSet('')).to.be.true;
        expect(isSet('woo!')).to.be.true;
        expect(isSet(0)).to.be.true;
        expect(isSet(-200)).to.be.true;
        expect(isSet({})).to.be.true;
        expect(isSet(new Date())).to.be.true;
    });

});

describe('printObj()', () => {
    let testObj = {
        flibble: 2,
        jibble: {
            wibble: 7
        }
    };

    let singleLine = '{"flibble":2,"jibble":{"wibble":7}}';
    let multiLine = `{
  "flibble": 2,
  "jibble": {
    "wibble": 7
  }
}`;

    it('prints object contents on a single line by default', () => {
        expect(printObj(testObj)).to.equal(singleLine);
    });

    it('multiline option gives multiline output', () => {
        expect(printObj(testObj, true)).to.equal(multiLine);
    });

});

describe('escapeForRegex()', () => {
    let part1 = 'Hmmm';
    let part2 = 'Ah';
    let regExSpecialChars = [
        '\\', '^', '$', '*', '+', '?', '.',
        '(', ')', '|', '{', '}', '[', ']'
    ];

    for (let char of regExSpecialChars) {
        it(`should escape ${char}`, () => {
            expect(escapeForRegex(part1 + char + part2))
                .to.equal(part1 + '\\' + char + part2);
        });
    }

});
