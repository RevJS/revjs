import { IModelMeta } from 'rev-models/models';
import { initialiseMeta } from 'rev-models/models/meta';
import * as f from 'rev-models/fields';

import { IApiMeta, initialiseApiMeta } from '../meta';

import { expect } from 'chai';

class TestModel {
    id: number = 1;
    name: string = 'A Test Model';
    date: Date = new Date();
}

let testMeta: IModelMeta<TestModel> = {
    fields: [
        new f.IntegerField('id', 'Id'),
        new f.TextField('name', 'Name'),
        new f.DateField('date', 'Date')
    ]
};
initialiseMeta(TestModel, testMeta);

let apiMeta: IApiMeta;

describe('initialiseApiMeta()', () => {

    it('does not throw if api metadata is a valid list of operations', () => {
        apiMeta = {
            operations: [ 'create', 'read' ]
        };
        expect(() => {
            initialiseApiMeta(testMeta, apiMeta);
        }).to.not.throw();
    });

    it('converts "all" to the complete list of operations', () => {
        apiMeta = {
            operations: 'all'
        };
        expect(() => {
            initialiseApiMeta(testMeta, apiMeta);
        }).to.not.throw();
        expect(apiMeta.operations).to.deep.equal(['create','read','update','remove']);
    });

    it('throws an error if operations key is missing', () => {
        apiMeta = <any> {};
        expect(() => {
            initialiseApiMeta(testMeta, null);
        }).to.throw('API metadata must contain a valid "operations" entry');
        expect(() => {
            initialiseApiMeta(testMeta, apiMeta);
        }).to.throw('API metadata must contain a valid "operations" entry');
    });

    it('throws an error if operations key is not "all" or an array', () => {
        expect(() => {
            initialiseApiMeta(testMeta, { operations: 'some' } as any);
        }).to.throw('API metadata must contain a valid "operations" entry');
        expect(() => {
            initialiseApiMeta(testMeta, { operations: {} } as any);
        }).to.throw('API metadata must contain a valid "operations" entry');
    });

    it('throws an error if operations array contains invalid operations', () => {
        apiMeta = <any> {
            operations: [
                'create',
                'read',
                'destroy',
                'modify'
            ]};
        expect(() => {
            initialiseApiMeta(testMeta, apiMeta);
        }).to.throw('Invalid operation in operations list');
    });

});
