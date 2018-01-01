
import { expect } from 'chai';
import { ModelApiBackend } from '../client';

describe('ModelApiBackend', () => {

    it('can be constructed with an apiUrl', () => {
        expect(() => {
            new ModelApiBackend('/api');
        }).not.to.throw();
    });

    it('throws if apiUrl is not provided', () => {
        expect(() => {
            new (ModelApiBackend as any)();
        }).to.throw('You must provide an apiUrl');
    });

});
