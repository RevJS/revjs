
import { expect } from 'chai';
import { sortRecords } from '../sort';

let testRecords = [
    {
        name: 'Zelda',
        score: 12,
        registered: '2017-01-01',
        category: 'A'
    },
    {
        name: 'max Payne',
        score: 28,
        registered: '2015-01-01',
        category: 'B'
    },
    {
        name: 'Duke Nukem',
        score: 52,
        registered: '2005-01-01',
        category: 'B'
    },
    {
        name: 'Mario',
        score: 12,
        registered: '2012-01-01',
        category: 'A'
    },
    {
        name: 'lara Croft',
        score: 34,
        registered: '2005-01-02',
        category: 'A'
    },
];

function expectOrder(result: object[], field: string, order: any[]) {
    let vals: any[] = [];
    for (let i = 0; i < order.length; i++) {
        vals.push(result[i][field]);
    }
    expect(vals).to.deep.equal(order);
}

describe('sortRecords()', () => {

    it('returns records in ascending order by defailt', () => {
        let res = sortRecords(testRecords, ['name']);
        expectOrder(res, 'name', [
            'Duke Nukem',
            'lara Croft',
            'Mario',
            'max Payne',
            'Zelda'
        ]);
    });

    it('returns records in ascending order when "asc" is specified', () => {
        let res = sortRecords(testRecords, ['name asc']);
        expectOrder(res, 'name', [
            'Duke Nukem',
            'lara Croft',
            'Mario',
            'max Payne',
            'Zelda'
        ]);
    });

    it('returns records in descending order when "desc" is specified', () => {
        let res = sortRecords(testRecords, ['name desc']);
        expectOrder(res, 'name', [
            'Zelda',
            'max Payne',
            'Mario',
            'lara Croft',
            'Duke Nukem'
        ]);
    });

    it('items are ordered by each field in turn', () => {
        let res = sortRecords(testRecords, ['score', 'name desc']);
        expectOrder(res, 'name', [
            'Zelda',        // score: 12
            'Mario',        // score: 12
            'max Payne',    // score: 28
            'lara Croft',   // score: 34
            'Duke Nukem'    // score: 52
        ]);
    });

    it('asc / desc works as expected for subsequent fields', () => {
        let res = sortRecords(testRecords, ['score', 'name asc']);
        expectOrder(res, 'name', [
            'Mario',        // score: 12
            'Zelda',        // score: 12
            'max Payne',    // score: 28
            'lara Croft',   // score: 34
            'Duke Nukem'    // score: 52
        ]);
    });

    it('date ordering works', () => {
        let res = sortRecords(testRecords, ['registered']);
        expectOrder(res, 'name', [
            'Duke Nukem',   // registered: 2005
            'lara Croft',   // registered: 2005
            'Mario',        // registered: 2012
            'max Payne',    // registered: 2015
            'Zelda',        // registered: 2017
        ]);
    });

    it('category grouping and sorting works', () => {
        let res = sortRecords(testRecords, ['category', 'registered desc']);
        expectOrder(res, 'name', [
            'Zelda',        // cat: A, registered: 2017
            'Mario',        // cat: A, registered: 2012
            'lara Croft',   // cat: A, registered: 2005
            'max Payne',    // cat: B, registered: 2015
            'Duke Nukem',   // cat: B, registered: 2005
        ]);
    });

});
