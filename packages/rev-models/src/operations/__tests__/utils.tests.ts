
import { expect } from 'chai';
import { getModelPrimaryKeyQuery } from '../utils';

class TestModel {
    id: number;
    id2: number;
    name: string;
}

describe('getModelPrimaryKeyQuery()', () => {

    it('returns a query for a model with one primary key', () => {
        let meta: any = { primaryKey: 'id' };
        let model = new TestModel();
        Object.assign(model, { id: 12, name: 'fred' });
        expect(getModelPrimaryKeyQuery(model, meta))
            .to.deep.equal({ id: 12 });
    });

    it('throws an error if meta.primaryKey is not defined', () => {
        let meta: any = {};
        let model = new TestModel();
        Object.assign(model, { id: 12, name: 'fred' });
        expect(() => {
            getModelPrimaryKeyQuery(model, meta);
        }).to.throw('no primaryKey defined');
    });

    it('throws an error if meta.primaryKey is an empty string', () => {
        let meta: any = { primaryKey: '' };
        let model = new TestModel();
        Object.assign(model, { id: 12, name: 'fred' });
        expect(() => {
            getModelPrimaryKeyQuery(model, meta);
        }).to.throw('no primaryKey defined');
    });

    it('throws an error if a primary key field does not have a value', () => {
        let meta: any = { primaryKey: 'id2' };
        let model = new TestModel();
        Object.assign(model, { id: 12, name: 'fred' });
        expect(() => {
            getModelPrimaryKeyQuery(model, meta);
        }).to.throw('primary key field \'id2\' is undefined');
    });

});
