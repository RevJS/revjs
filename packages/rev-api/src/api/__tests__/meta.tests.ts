import * as rev from 'rev-models';
import * as f from 'rev-models/lib/fields';

import { initialiseApiMeta, IApiMethod, IApiMetaDefinition, IApiMeta } from '../meta';

import { expect } from 'chai';

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

let models: rev.ModelRegistry;

let apiMetaDef: IApiMetaDefinition;
let apiMeta: IApiMeta;

describe('initialiseApiMeta() - system methods', () => {

    beforeEach(() => {
        models = new rev.ModelRegistry();
        models.registerBackend('default', new rev.InMemoryBackend());
        models.register(TestModel, testMeta);
        testMeta = models.getModelMeta(TestModel);
    });

    describe('system methods', () => {

        it('does not throw if api metadata has an empty list of methods', () => {
            apiMetaDef = {
                methods: {}
            };
            expect(() => {
                initialiseApiMeta(testMeta, apiMetaDef);
            }).to.not.throw();
        });

        it('does not throw if api metadata has a valid list of methods', () => {
            apiMetaDef = {
                methods: {create: true, read: true }
            };
            expect(() => {
                initialiseApiMeta(testMeta, apiMetaDef);
            }).to.not.throw();
        });

        it('converts method string array as expected', () => {
            apiMetaDef = {
                methods: [ 'create', 'update' ]
            };
            apiMeta = initialiseApiMeta(testMeta, apiMetaDef);
            expect(apiMeta).to.deep.equal({
                methods: {
                    create: true,
                    update: true
                }
            });
        });

        it('throws an error if model metadata is not supplied', () => {
            apiMetaDef = {
                methods: { read: true }
            };
            expect(() => {
                initialiseApiMeta(null, apiMetaDef);
            }).to.throw('Model metadata must be supplied');
        });

        it('throws an error if methods key is missing', () => {
            apiMetaDef = {} as any;
            expect(() => {
                initialiseApiMeta(testMeta, null);
            }).to.throw(`API metadata must include a valid 'methods' key`);
            expect(() => {
                initialiseApiMeta(testMeta, apiMetaDef);
            }).to.throw(`API metadata must include a valid 'methods' key`);
        });

        it('throws an error if methods key is not an object', () => {
            expect(() => {
                initialiseApiMeta(testMeta, { methods: 'some' } as any);
            }).to.throw(`API metadata must include a valid 'methods' key`);
        });

        it('throws an error if methods array contains invalid methods', () => {
            apiMetaDef = {
                methods: [ 'create', 'read', 'destroy', 'update' ]
            };
            expect(() => {
                initialiseApiMeta(testMeta, apiMetaDef);
            }).to.throw(`Method 'destroy' is not recognised`);
        });

        it('throws an error if methods object contains invalid methods', () => {
            apiMetaDef = {
                methods: {
                    create: true,
                    read: true,
                    destroy: true,
                    update: true
                }} as any;
            expect(() => {
                initialiseApiMeta(testMeta, apiMetaDef);
            }).to.throw(`Method 'destroy' is not recognised`);
        });

    });

    describe('custom methods', () => {

        it('does not throw if api metadata has an empty dict of methods', () => {
            apiMetaDef = {
                methods: {}
            };
            expect(() => {
                initialiseApiMeta(testMeta, apiMetaDef);
            }).to.not.throw();
        });

        it('does not throw if api metadata defines a method with no args', () => {
            apiMetaDef = {
                methods: {
                    create: true,
                    testMethod: {
                        args: [],
                        handler: (() => {}) as any
                    }
                }
            };
            expect(() => {
                initialiseApiMeta(testMeta, apiMetaDef);
            }).to.not.throw();
        });

        it('sets up metadata for a method with one Field arg', () => {
            let testField = new f.TextField('arg1');
            apiMetaDef = {
                methods: {
                    create: true,
                    testMethod: {
                        args: [
                            testField
                        ],
                        handler: (() => {}) as any
                    }
                }
            };
            apiMeta = initialiseApiMeta(testMeta, apiMetaDef);
            expect(apiMetaDef.methods).to.be.an('object');
            expect(apiMetaDef.methods).to.have.property('testMethod');
            let method = apiMeta.methods.testMethod as IApiMethod;
            expect(method.args).to.have.length(1);
            expect(method.args[0]).to.equal(testField);
        });

        it('sets up metadata for a method with two Field args', () => {
            let testField1 = new f.TextField('arg1');
            let testField2 = new f.IntegerField('arg2');
            apiMetaDef = {
                methods: {
                    create: true,
                    testMethod: {
                        args: [
                            testField1,
                            testField2
                        ],
                        handler: (() => {}) as any
                    }
                }
            };
            apiMeta = initialiseApiMeta(testMeta, apiMetaDef);
            expect(apiMetaDef.methods).to.be.an('object');
            expect(apiMetaDef.methods).to.have.property('testMethod');
            let method = apiMeta.methods.testMethod as IApiMethod;
            expect(method.args).to.have.length(2);
            expect(method.args[0]).to.equal(testField1);
            expect(method.args[1]).to.equal(testField2);
        });

        it('sets up metadata for a method with one field-name arg', () => {
            apiMetaDef = {
                methods: {
                    create: true,
                    testMethod: {
                        args: ['name'],
                        handler: (() => {}) as any
                    }
                }
            };
            apiMeta = initialiseApiMeta(testMeta, apiMetaDef);
            expect(apiMetaDef.methods).to.be.an('object');
            expect(apiMetaDef.methods).to.have.property('testMethod');
            let method = apiMeta.methods.testMethod as IApiMethod;
            expect(method.args).to.have.length(1);
            expect(method.args[0]).to.equal(nameField);
        });

        it('sets up metadata for a method with two field-name args', () => {
            apiMetaDef = {
                methods: {
                    create: true,
                    testMethod: {
                        args: ['name', 'date'],
                        handler: (() => {}) as any
                    }
                }
            };
            apiMeta = initialiseApiMeta(testMeta, apiMetaDef);
            expect(apiMetaDef.methods).to.be.an('object');
            expect(apiMetaDef.methods).to.have.property('testMethod');
            let method = apiMeta.methods.testMethod as IApiMethod;
            expect(method.args).to.have.length(2);
            expect(method.args[0]).to.equal(nameField);
            expect(method.args[1]).to.equal(dateField);
        });

        it('sets up metadata for a method with mixed args', () => {
            let testField = new f.TextField('arg1');
            apiMetaDef = {
                methods: {
                    create: true,
                    testMethod: {
                        args: [
                            'date',
                            testField
                        ],
                        handler: (() => {}) as any
                    }
                }
            };
            apiMeta = initialiseApiMeta(testMeta, apiMetaDef);
            expect(apiMetaDef.methods).to.be.an('object');
            expect(apiMetaDef.methods).to.have.property('testMethod');
            let method = apiMeta.methods.testMethod as IApiMethod;
            expect(method.args).to.have.length(2);
            expect(method.args[0]).to.equal(dateField);
            expect(method.args[1]).to.equal(testField);
        });

        it('throws an error when method definition is missing keys', () => {
            apiMetaDef = {
                methods: {
                    testMethod: {} as any
                }
            };
            expect(() => {
                initialiseApiMeta(testMeta, apiMetaDef);
            }).to.throw('API methods must define an args array and a handler function');
        });

        it('throws an error when method definition keys are invalid', () => {
            apiMetaDef = {
                methods: {
                    testMethod: {
                        args: { test: 'fail' } as any,
                        handler: 'nah' as any
                    }
                }
            };
            expect(() => {
                initialiseApiMeta(testMeta, apiMetaDef);
            }).to.throw('API methods must define an args array and a handler function');
        });

        it('throws an error when field name does not match the model', () => {
            apiMetaDef = {
                methods: {
                    testMethod: {
                        args: ['id', 'not_valid'],
                        handler: (() => {}) as any
                    }
                }
            };
            expect(() => {
                initialiseApiMeta(testMeta, apiMetaDef);
            }).to.throw(`Field 'not_valid' does not exist in model`);
        });

        it('throws an error when an invalid type is passed as an arg', () => {
            apiMetaDef = {
                methods: {
                    testMethod: {
                        args: ['id', new Date() as any, nameField],
                        handler: (() => {}) as any
                    }
                }
            };
            expect(() => {
                initialiseApiMeta(testMeta, apiMetaDef);
            }).to.throw(`must either be an instance of a Field or a string`);
        });

    });

});
