
import { expect } from 'chai';
import { isSet } from '../index';

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