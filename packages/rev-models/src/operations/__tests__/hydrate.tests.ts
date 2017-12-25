
import { expect } from 'chai';

import * as d from '../../decorators';
import { MockBackend } from './mock-backend';
import { ModelManager } from '../../models/manager';
import { hydrate } from '../hydrate';

class TestRelatedModel {}

class TestModel {
    @d.TextField()
        name: string;
    @d.IntegerField()
        age: number;
    @d.RelatedModel({ model: 'TestRelatedModel' })
        related: TestRelatedModel;

    testMethod() {}

    constructor(data?: any) {
        if (data) {
            Object.assign(this, data);
        }
    }
}

let mockBackend: MockBackend;
let manager: ModelManager;

describe('rev.operations.hydrate()', () => {

    beforeEach(() => {
        mockBackend = new MockBackend();
        manager = new ModelManager();
        manager.registerBackend('default', mockBackend);
        manager.register(TestModel);
    });

    it('assigns passed values to a new instance of the model', () => {
        let res = hydrate(manager, TestModel, {
            name: 'Bob',
            age: 35
        });
        expect(res).to.deep.equal(new TestModel({
            name: 'Bob',
            age: 35
        }));
    });

    it('does not need all values to be passed', () => {
        let res = hydrate(manager, TestModel, {
            age: 35
        });
        expect(res).to.deep.equal(new TestModel({
            age: 35
        }));
    });

    it('does not hydrate relational fields', () => {
        let res = hydrate(manager, TestModel, {
            name: 'Bob',
            age: 35,
            related: 112
        });
        expect(res).to.deep.equal(new TestModel({
            name: 'Bob',
            age: 35
        }));
    });

    it('ignores fields not present in model', () => {
        let res = hydrate(manager, TestModel, {
            extra_data: true,
            age: 35
        });
        expect(res).to.deep.equal(new TestModel({
            age: 35
        }));
    });

    it('ignores non-object data', () => {
        let res = hydrate(manager, TestModel, 'flibble');
        expect(res).to.deep.equal(new TestModel());
    });

    it('returns a plain instance if data is not defined', () => {
        let res = hydrate(manager, TestModel, undefined);
        expect(res).to.deep.equal(new TestModel());
    });

});
