import { IModelMeta } from 'rev-models/models';
import { initialiseMeta } from 'rev-models/models/meta';
import * as f from 'rev-models/fields';

import { IFormMeta, checkFormMeta } from '../meta';

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

let formMeta: IFormMeta;

describe('checkFormMeta()', () => {

    it('does not throw if form metadata is valid', () => {
        formMeta = {
            title: 'Test Form',
            fields: [ 'name', 'date' ]
        };
        expect(() => {
            checkFormMeta(testMeta, formMeta);
        }).to.not.throw();
    });

    it('throws an error if fields metadata is missing', () => {
        formMeta = <any> {};
        expect(() => {
            checkFormMeta(testMeta, null);
        }).to.throw('Form metadata must contain a "fields" array');
        expect(() => {
            checkFormMeta(testMeta, formMeta);
        }).to.throw('Form metadata must contain a "fields" array');
    });

    it('throws an error if fields array contains invalid item types', () => {
        formMeta = <any> {
            fields: [
                'name',
                'date',
                new f.IntegerField('a', 'A')
            ]};
        expect(() => {
            checkFormMeta(testMeta, formMeta);
        }).to.throw('is not a string');
    });

    it('throws an error if fields array contains duplicate items', () => {
        formMeta = <any> {
            fields: [
                'name',
                'date',
                'date'
            ]};
        expect(() => {
            checkFormMeta(testMeta, formMeta);
        }).to.throw(`Duplicate field 'date' in the fields array`);
    });

    it('throws an error if field does not exist in the model', () => {
        formMeta = <any> {
            fields: [
                'first_name',
                'last_name'
            ]};
        expect(() => {
            checkFormMeta(testMeta, formMeta);
        }).to.throw(`Field 'first_name' is not defined for model 'TestModel'.`);
    });

});
