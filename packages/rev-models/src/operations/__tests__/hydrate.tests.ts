
import { expect } from 'chai';

import * as d from '../../decorators';
import { MockBackend } from './mock-backend';
import { ModelManager } from '../../models/manager';
import { hydrate } from '../hydrate';

class TestModel {
    @d.TextField()
        name: string = 'Sharon';
    @d.IntegerField()
        age: number = 22;
    
    testMethod() {}
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
        expect(res.name).to.equal('Bob');
        expect(res.age).to.equal(35);
        expect(res.testMethod).to.be.a('function');
    });

    it('does not need all values to be passed', () => {
        let res = hydrate(manager, TestModel, {
            age: 35
        });
        expect(res.name).to.equal('Sharon');
        expect(res.age).to.equal(35);
        expect(res.testMethod).to.be.a('function');
    });

    it('ignores non-object data', () => {
        let res = hydrate(manager, TestModel, 'flibble');
        expect(res.name).to.equal('Sharon');
        expect(res.age).to.equal(22);
        expect(res.testMethod).to.be.a('function');
    });

    it('returns a plain instance if data is not defined', () => {
        let res = hydrate(manager, TestModel, undefined);
        expect(res.name).to.equal('Sharon');
        expect(res.age).to.equal(22);
        expect(res.testMethod).to.be.a('function');
    });

});
