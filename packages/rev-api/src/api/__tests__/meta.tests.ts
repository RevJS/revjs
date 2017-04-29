import * as rev from 'rev-models';
import * as f from 'rev-models/lib/fields';

import { initialiseApiMeta, IApiMeta } from '../meta';

import { expect } from 'chai';
import { ModelApiRegistry } from '../../registry/registry';
import { IApiDefinition } from '../definition';

class TestModel extends rev.Model {
    id: number = 1;
    name: string = 'A Test Model';
    date: Date = new Date();
}

let idField = new f.IntegerField('id');
let nameField = new f.TextField('name');
let dateField = new f.DateField('date');

let testMeta: rev.IModelMeta<TestModel> = {
    fields: [
        idField,
        nameField,
        dateField
    ]
};

class UnRegModel extends rev.Model {}

let models: rev.ModelRegistry;
let apiReg: ModelApiRegistry;

let apiMetaDef: IApiDefinition<TestModel>;
let apiMeta: IApiMeta;

describe('initialiseApiMeta() - system methods', () => {

    beforeEach(() => {
        models = new rev.ModelRegistry();
        models.registerBackend('default', new rev.InMemoryBackend());
        models.register(TestModel, testMeta);
        apiReg = new ModelApiRegistry(models);
        testMeta = models.getModelMeta(TestModel);
    });

    describe('operations', () => {

        it('does not throw if api metadata has no operations or methods', () => {
            apiMetaDef = {
                model: TestModel
            };
            expect(() => {
                initialiseApiMeta(apiReg, apiMetaDef);
            }).to.not.throw();
        });

        it('does not throw if api metadata has an empty list of operations', () => {
            apiMetaDef = {
                model: TestModel,
                operations: []
            };
            expect(() => {
                initialiseApiMeta(apiReg, apiMetaDef);
            }).to.not.throw();
        });

        it('does not throw if api metadata has a valid list of methods', () => {
            apiMetaDef = {
                model: TestModel,
                operations: [ 'create', 'read' ]
            };
            expect(() => {
                initialiseApiMeta(apiReg, apiMetaDef);
            }).to.not.throw();
        });

        it('returns apiMeta as expected', () => {
            apiMetaDef = {
                model: TestModel,
                operations: [ 'create', 'update' ]
            };
            apiMeta = initialiseApiMeta(apiReg, apiMetaDef);
            expect(apiMeta).to.deep.equal({
                model: TestModel,
                operations: [ 'create', 'update' ],
                methods: {}
            });
        });

        it('throws an error if model key is missing', () => {
            apiMetaDef = {} as any;
            expect(() => {
                initialiseApiMeta(apiReg, null);
            }).to.throw(`API metadata must include the 'model' key`);
            expect(() => {
                initialiseApiMeta(apiReg, apiMetaDef);
            }).to.throw(`API metadata must include the 'model' key`);
        });

        it('throws an error if model is not registered', () => {
            apiMetaDef = {
                model: UnRegModel,
                operations: []
            } as any;
            expect(() => {
                initialiseApiMeta(apiReg, apiMetaDef);
            }).to.throw('RegistryError');
        });

        it('throws an error if operations array contains invalid methods', () => {
            apiMetaDef = {
                model: TestModel,
                operations: [ 'create', 'read', 'destroy', 'update' ]
            };
            expect(() => {
                initialiseApiMeta(apiReg, apiMetaDef);
            }).to.throw(`Invalid operation name 'destroy'`);
        });

    });

    describe('custom methods', () => {

        it('does not throw if api metadata has an empty dict of methods', () => {
            apiMetaDef = {
                model: TestModel,
                methods: {}
            };
            expect(() => {
                initialiseApiMeta(apiReg, apiMetaDef);
            }).to.not.throw();
        });

        it('does not throw if api metadata defines a method with no args', () => {
            apiMetaDef = {
                model: TestModel,
                methods: {
                    testMethod: {
                        args: [],
                        handler: (() => {}) as any
                    }
                }
            };
            expect(() => {
                initialiseApiMeta(apiReg, apiMetaDef);
            }).to.not.throw();
        });

        it('sets up metadata for a method with one Field arg', () => {
            let testField = new f.TextField('arg1');
            apiMetaDef = {
                model: TestModel,
                methods: {
                    testMethod: {
                        args: [
                            testField
                        ],
                        handler: (() => {}) as any
                    }
                }
            };
            apiMeta = initialiseApiMeta(apiReg, apiMetaDef);
            expect(apiMetaDef.methods).to.be.an('object');
            expect(apiMetaDef.methods).to.have.property('testMethod');
            let method = apiMeta.methods.testMethod;
            expect(method.args).to.have.length(1);
            expect(method.args[0]).to.equal(testField);
        });

        it('sets up metadata for a method with two Field args', () => {
            let testField1 = new f.TextField('arg1');
            let testField2 = new f.IntegerField('arg2');
            apiMetaDef = {
                model: TestModel,
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
            apiMeta = initialiseApiMeta(apiReg, apiMetaDef);
            expect(apiMetaDef.methods).to.be.an('object');
            expect(apiMetaDef.methods).to.have.property('testMethod');
            let method = apiMeta.methods.testMethod;
            expect(method.args).to.have.length(2);
            expect(method.args[0]).to.equal(testField1);
            expect(method.args[1]).to.equal(testField2);
        });

        it('sets up metadata for a method with one field-name arg', () => {
            apiMetaDef = {
                model: TestModel,
                methods: {
                    testMethod: {
                        args: ['name'],
                        handler: (() => {}) as any
                    }
                }
            };
            apiMeta = initialiseApiMeta(apiReg, apiMetaDef);
            expect(apiMetaDef.methods).to.be.an('object');
            expect(apiMetaDef.methods).to.have.property('testMethod');
            let method = apiMeta.methods.testMethod;
            expect(method.args).to.have.length(1);
            expect(method.args[0]).to.equal(nameField);
        });

        it('sets up metadata for a method with two field-name args', () => {
            apiMetaDef = {
                model: TestModel,
                methods: {
                    testMethod: {
                        args: ['name', 'date'],
                        handler: (() => {}) as any
                    }
                }
            };
            apiMeta = initialiseApiMeta(apiReg, apiMetaDef);
            expect(apiMetaDef.methods).to.be.an('object');
            expect(apiMetaDef.methods).to.have.property('testMethod');
            let method = apiMeta.methods.testMethod;
            expect(method.args).to.have.length(2);
            expect(method.args[0]).to.equal(nameField);
            expect(method.args[1]).to.equal(dateField);
        });

        it('sets up metadata for a method with mixed args', () => {
            let testField = new f.TextField('arg1');
            apiMetaDef = {
                model: TestModel,
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
            apiMeta = initialiseApiMeta(apiReg, apiMetaDef);
            expect(apiMetaDef.methods).to.be.an('object');
            expect(apiMetaDef.methods).to.have.property('testMethod');
            let method = apiMeta.methods.testMethod;
            expect(method.args).to.have.length(2);
            expect(method.args[0]).to.equal(dateField);
            expect(method.args[1]).to.equal(testField);
        });

        it('throws an error if methods key is not an object', () => {
            expect(() => {
                initialiseApiMeta(apiReg, { model: TestModel, methods: 'some' } as any);
            }).to.throw(`'methods' must be an object`);
        });

        it('throws an error when method definition is missing keys', () => {
            apiMetaDef = {
                model: TestModel,
                methods: {
                    testMethod: {} as any
                }
            };
            expect(() => {
                initialiseApiMeta(apiReg, apiMetaDef);
            }).to.throw('API methods must define an args array and a handler function');
        });

        it('throws an error when method definition keys are invalid', () => {
            apiMetaDef = {
                model: TestModel,
                methods: {
                    testMethod: {
                        args: { test: 'fail' } as any,
                        handler: 'nah' as any
                    }
                }
            };
            expect(() => {
                initialiseApiMeta(apiReg, apiMetaDef);
            }).to.throw('API methods must define an args array and a handler function');
        });

        it('throws an error when field name does not match the model', () => {
            apiMetaDef = {
                model: TestModel,
                methods: {
                    testMethod: {
                        args: ['id', 'not_valid'],
                        handler: (() => {}) as any
                    }
                }
            };
            expect(() => {
                initialiseApiMeta(apiReg, apiMetaDef);
            }).to.throw(`Field 'not_valid' does not exist in model`);
        });

        it('throws an error when an invalid type is passed as an arg', () => {
            apiMetaDef = {
                model: TestModel,
                methods: {
                    testMethod: {
                        args: ['id', new Date() as any, nameField],
                        handler: (() => {}) as any
                    }
                }
            };
            expect(() => {
                initialiseApiMeta(apiReg, apiMetaDef);
            }).to.throw(`must either be an instance of a Field or a string`);
        });

    });

});
