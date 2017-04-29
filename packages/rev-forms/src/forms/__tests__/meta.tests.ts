
import * as rev from 'rev-models';

import { IFormMeta, checkFormMeta } from '../meta';

import { expect } from 'chai';

class TestModel extends rev.Model {
    @rev.IntegerField()
        id: number = 1;
    @rev.TextField()
        name: string = 'A Test Model';
    @rev.DateField()
        date: Date = new Date();
}

let formMeta: IFormMeta;
let models: rev.ModelRegistry;
let testMeta: rev.IModelMeta<TestModel>;

describe('checkFormMeta()', () => {

    beforeEach(() => {
        models = new rev.ModelRegistry();
        models.registerBackend('default', new rev.InMemoryBackend());
        models.register(TestModel);
        testMeta = models.getModelMeta(TestModel);
    });

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
        formMeta = {} as any;
        expect(() => {
            checkFormMeta(testMeta, null);
        }).to.throw('Form metadata must contain a "fields" array');
        expect(() => {
            checkFormMeta(testMeta, formMeta);
        }).to.throw('Form metadata must contain a "fields" array');
    });

    it('throws an error if fields array contains invalid item types', () => {
        formMeta = {
            fields: [
                'name',
                'date',
                new rev.fields.IntegerField('a')
            ]} as any;
        expect(() => {
            checkFormMeta(testMeta, formMeta);
        }).to.throw('is not a string');
    });

    it('throws an error if fields array contains duplicate items', () => {
        formMeta = {
            fields: [
                'name',
                'date',
                'date'
            ]} as any;
        expect(() => {
            checkFormMeta(testMeta, formMeta);
        }).to.throw(`Duplicate field 'date' in the fields array`);
    });

    it('throws an error if field does not exist in the model', () => {
        formMeta = {
            fields: [
                'first_name',
                'last_name'
            ]} as any;
        expect(() => {
            checkFormMeta(testMeta, formMeta);
        }).to.throw(`Field 'first_name' is not defined for model 'TestModel'.`);
    });

});
