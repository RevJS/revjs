import { IModelMeta } from 'rev-models/lib/models';
import { initialiseMeta } from 'rev-models/lib/models/meta';
import * as f from 'rev-models/lib/fields';

import { IApiMeta, initialiseApiMeta } from '../meta';

import { expect } from 'chai';

class TestModel {
    id: number = 1;
    name: string = 'A Test Model';
    date: Date = new Date();
}

let idField = new f.IntegerField('id');
let nameField = new f.TextField('name');
let dateField = new f.DateField('date');

let testMeta: IModelMeta<TestModel> = {
    fields: [
        idField,
        nameField,
        dateField
    ]
};
initialiseMeta(TestModel, testMeta);

let apiMeta: IApiMeta;

describe('initialiseApiMeta() - operations', () => {

    it('does not throw if api metadata has a valid list of operations', () => {
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
        expect(apiMeta.operations).to.deep.equal(['create', 'read', 'update', 'remove']);
    });

    it('throws an error if model metadata is not initialised', () => {
        let modelMeta = { fields: [] } as any;
        apiMeta = {
            operations: 'all'
        };
        expect(() => {
            initialiseApiMeta(null, apiMeta);
        }).to.throw('Supplied metadata is not an object');
        expect(() => {
            initialiseApiMeta(modelMeta, apiMeta);
        }).to.throw('Supplied metadata has not been initialised');
    });

    it('throws an error if operations key is missing', () => {
        apiMeta = {} as any;
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
        apiMeta = {
            operations: [
                'create',
                'read',
                'destroy',
                'modify'
            ]} as any;
        expect(() => {
            initialiseApiMeta(testMeta, apiMeta);
        }).to.throw('Invalid operation in operations list');
    });

});

describe('initialiseApiMeta() - methods', () => {

    it('does not throw if api metadata has an empty dict of methods', () => {
        apiMeta = {
            operations: ['create'],
            methods: {}
        };
        expect(() => {
            initialiseApiMeta(testMeta, apiMeta);
        }).to.not.throw();
    });

    it('does not throw if api metadata defines a method with no args', () => {
        apiMeta = {
            operations: ['create'],
            methods: {
                testMethod: {
                    args: [],
                    handler: (() => {}) as any
                }
            }
        };
        expect(() => {
            initialiseApiMeta(testMeta, apiMeta);
        }).to.not.throw();
    });

    it('sets up metadata for a method with one Field arg', () => {
        let testField = new f.TextField('arg1');
        apiMeta = {
            operations: ['create'],
            methods: {
                testMethod: {
                    args: [
                        testField
                    ],
                    handler: (() => {}) as any
                }
            }
        };
        initialiseApiMeta(testMeta, apiMeta);
        expect(apiMeta.methods).to.be.an('object');
        expect(apiMeta.methods).to.have.property('testMethod');
        expect(apiMeta.methods.testMethod.args).to.have.length(1);
        expect(apiMeta.methods.testMethod.args[0]).to.equal(testField);
    });

    it('sets up metadata for a method with two Field args', () => {
        let testField1 = new f.TextField('arg1');
        let testField2 = new f.IntegerField('arg2');
        apiMeta = {
            operations: ['create'],
            methods: {
                testMethod: {
                    args: [
                        testField1,
                        testField2
                    ],
                    handler: (() => {}) as any
                }
            }
        };
        initialiseApiMeta(testMeta, apiMeta);
        expect(apiMeta.methods).to.be.an('object');
        expect(apiMeta.methods).to.have.property('testMethod');
        expect(apiMeta.methods.testMethod.args).to.have.length(2);
        expect(apiMeta.methods.testMethod.args[0]).to.equal(testField1);
        expect(apiMeta.methods.testMethod.args[1]).to.equal(testField2);
    });

    it('sets up metadata for a method with one field-name arg', () => {
        apiMeta = {
            operations: ['create'],
            methods: {
                testMethod: {
                    args: ['name'],
                    handler: (() => {}) as any
                }
            }
        };
        initialiseApiMeta(testMeta, apiMeta);
        expect(apiMeta.methods).to.be.an('object');
        expect(apiMeta.methods).to.have.property('testMethod');
        expect(apiMeta.methods.testMethod.args).to.have.length(1);
        expect(apiMeta.methods.testMethod.args[0]).to.equal(nameField);
    });

    it('sets up metadata for a method with two field-name args', () => {
        apiMeta = {
            operations: ['create'],
            methods: {
                testMethod: {
                    args: ['name', 'date'],
                    handler: (() => {}) as any
                }
            }
        };
        initialiseApiMeta(testMeta, apiMeta);
        expect(apiMeta.methods).to.be.an('object');
        expect(apiMeta.methods).to.have.property('testMethod');
        expect(apiMeta.methods.testMethod.args).to.have.length(2);
        expect(apiMeta.methods.testMethod.args[0]).to.equal(nameField);
        expect(apiMeta.methods.testMethod.args[1]).to.equal(dateField);
    });

    it('sets up metadata for a method with mixed args', () => {
        let testField = new f.TextField('arg1');
        apiMeta = {
            operations: ['create'],
            methods: {
                testMethod: {
                    args: [
                        'date',
                        testField
                    ],
                    handler: (() => {}) as any
                }
            }
        };
        initialiseApiMeta(testMeta, apiMeta);
        expect(apiMeta.methods).to.be.an('object');
        expect(apiMeta.methods).to.have.property('testMethod');
        expect(apiMeta.methods.testMethod.args).to.have.length(2);
        expect(apiMeta.methods.testMethod.args[0]).to.equal(dateField);
        expect(apiMeta.methods.testMethod.args[1]).to.equal(testField);
    });

});
