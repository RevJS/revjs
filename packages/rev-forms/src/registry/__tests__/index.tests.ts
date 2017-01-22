import { IModelMeta } from 'rev-models/models';
import * as f from 'rev-models/fields';
import * as registry from '../index';
import { registry as modelRegistry } from 'rev-models/registry';

import { IFormMeta } from '../../forms/meta';

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

let formMeta: IFormMeta;

describe('ModelRegistry', () => {
    let testReg: registry.ModelFormRegistry;

    beforeEach(() => {
        modelRegistry.clearRegistry();
        testReg = new registry.ModelFormRegistry();
        formMeta = {
            title: 'Test Form',
            fields: [ 'name', 'date' ]
        };
    });

    describe('constructor()', () => {

        it('successfully creates a registry', () => {
            expect(() => {
                testReg = new registry.ModelFormRegistry()
            }).to.not.throw();
        });

    });

    describe('isRegistered()', () => {

        it('returns false when a model is not registered', () => {
            expect(testReg.isRegistered('TestModel', 'default')).to.equal(false);
        });

        it('returns true when a model is registered', () => {
            modelRegistry.register(TestModel, testMeta);
            testReg.register(TestModel, 'default', formMeta);
            expect(testReg.isRegistered('TestModel', 'default')).to.equal(true);
        });

    });

});
