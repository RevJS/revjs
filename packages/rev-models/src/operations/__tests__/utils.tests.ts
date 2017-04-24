
import { expect } from 'chai';
import { Model } from '../../models/model';
import { getModelPrimaryKeyQuery } from '../utils';

class TestModel extends Model {
    id: number;
    id2: number;
    name: string;
}

describe('getModelPrimaryKeyQuery()', () => {

    it('returns a query for a model with one primary key', () => {
        let meta = { primaryKey: ['id'] };
        let model = new TestModel({ id: 12, name: 'fred' });
        expect(getModelPrimaryKeyQuery(model, meta))
            .to.deep.equal({ id: 12 });
    });

    it('returns a query for a model with two primary keys', () => {
        let meta = { primaryKey: ['id', 'id2'] };
        let model = new TestModel({ id: 12, id2: 20, name: 'fred' });
        expect(getModelPrimaryKeyQuery(model, meta))
            .to.deep.equal({ id: 12, id2: 20 });
    });

    it('throws an error if meta.primaryKey is not defined', () => {
        let meta = {};
        let model = new TestModel({ id: 12, name: 'fred' });
        expect(() => {
            getModelPrimaryKeyQuery(model, meta);
        }).to.throw('no primaryKey defined');
    });

    it('throws an error if meta.primaryKey is an empty list', () => {
        let meta = { primaryKey: [] as any };
        let model = new TestModel({ id: 12, name: 'fred' });
        expect(() => {
            getModelPrimaryKeyQuery(model, meta);
        }).to.throw('no primaryKey defined');
    });

    it('throws an error if a primary key field does not have a value', () => {
        let meta = { primaryKey: ['id', 'id2'] };
        let model = new TestModel({ id: 12, name: 'fred' });
        expect(() => {
            getModelPrimaryKeyQuery(model, meta);
        }).to.throw('primary key field \'id2\' is undefined');
    });

});
