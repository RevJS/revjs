import * as rev from 'rev-models';
import * as f from 'rev-models/lib/fields';
import { initialiseApiMeta } from '../meta';

import { expect } from 'chai';
import { ModelApiManager } from '../../api/manager';
import { ApiOperations, ApiMethod } from '../../decorators/decorators';

const testDecoratedModelOperations = ['read', 'create'];
const testDecoratedMethodMeta = { modelArg: false };

@ApiOperations(testDecoratedModelOperations)
class TestDecoratedModel {

    @rev.TextField()
        name: string = 'A Test Model';

    @ApiMethod(testDecoratedMethodMeta)
    testMethod() {}
    testMethod2() {}
}

class TestModel {

    @rev.IntegerField()
        id: number = 1;
    @rev.TextField()
        name: string = 'A Test Model';
    @rev.DateField()
        date: Date = new Date();

    testMethod() {}
}

// class UnRegModel {}

let models: rev.ModelManager;
let apiManager: ModelApiManager;

describe('initialiseApiMeta()', () => {

    beforeEach(() => {
        models = new rev.ModelManager();
        models.registerBackend('default', new rev.InMemoryBackend());
        models.register(TestDecoratedModel);
        models.register(TestModel);
        apiManager = new ModelApiManager(models);
    });

    describe('decorator metadata', () => {

        it('adds apiMeta.operations from @ApiOperations decorator', () => {
            let meta = initialiseApiMeta(apiManager, TestDecoratedModel, undefined);
            expect(meta.operations).to.deep.equal(testDecoratedModelOperations);
        });

        it('adds apiMeta methods from @ApiMethod decorator', () => {
            let meta = initialiseApiMeta(apiManager, TestDecoratedModel, undefined);
            expect(meta.methods).to.deep.equal({
                testMethod: testDecoratedMethodMeta
            });
        });

        it('merges operations passed as meta with decorator meta', () => {
            let meta = initialiseApiMeta(apiManager, TestDecoratedModel, {
                operations: ['remove']
            });
            expect(meta.operations).to.deep.equal([
                'remove', 'read', 'create'
            ]);
        });

        it('merges methods passed as meta with decorator meta', () => {
            let meta = initialiseApiMeta(apiManager, TestDecoratedModel, {
                methods: {
                    testMethod2: { modelArg: true }
                }
            });
            expect(meta.methods).to.deep.equal({
                testMethod: { modelArg: false },
                testMethod2: { modelArg: true }
            });
        });

    });

    describe('model name', () => {

        it('gets set to class name if not passed in meta', () => {
            let meta = initialiseApiMeta(apiManager, TestModel, {
                operations: ['read']
            });
            expect(meta.model).to.equal('TestModel');
        });

        it('gets set to meta.model if set instead', () => {
            let meta = initialiseApiMeta(apiManager, TestModel, {
                model: 'TestDecoratedModel',
                operations: ['read']
            });
            expect(meta.model).to.equal('TestDecoratedModel');
        });

        it('throws if model name is not registered with model manager', () => {
            expect(() => {
                initialiseApiMeta(apiManager, TestModel, {
                    model: 'Blah',
                    operations: ['read']
                });
            }).to.throw(`Model 'Blah' is not registered with the model manager`);
        });

        it('throws if model name is already registered with the api manager', () => {
            apiManager.register(TestModel, { operations: ['read'] });
            expect(() => {
                initialiseApiMeta(apiManager, TestModel, {
                    operations: ['read']
                });
            }).to.throw(`Model 'TestModel' already has a registered API`);
        });

    });

    describe('api operations', () => {

        it('returns meta when valid operations are specified', () => {
            let validOps = ['create', 'update', 'read', 'remove'];
            let meta = initialiseApiMeta(apiManager, TestModel, {
                operations: validOps
            });
            expect(meta.operations).to.deep.equal(validOps);
        });

        it('throws an error if operations is not an array', () => {
            expect(() => {
                initialiseApiMeta(apiManager, TestModel, {
                    operations: 'all of them bru!' as any
                });
            }).to.throw(`API metadata 'operations' must be an array`);
        });

        it('throws an error if operations array contains invalid names', () => {
            expect(() => {
                initialiseApiMeta(apiManager, TestModel, {
                    operations: [ 'create', 'read', 'destroy', 'update' ]
                });
            }).to.throw(`Invalid operation name 'destroy'`);
        });

    });

    describe('api methods', () => {

        it('throws an error when method name is reserved', () => {
            expect(() => {
                initialiseApiMeta(apiManager, TestModel, {
                    methods: {
                        create: {}
                    }
                });
            }).to.throw(`is a reserved name`);
        });

        it('throws an error when method meta is not an object', () => {
            expect(() => {
                initialiseApiMeta(apiManager, TestModel, {
                    methods: [ 'testMethod1' ] as any
                });
            }).to.throw(`Invalid method definition found`);
        });

        it('throws an error when method does not exist on model', () => {
            expect(() => {
                initialiseApiMeta(apiManager, TestModel, {
                    methods: {
                        flibble: {}
                    }
                });
            }).to.throw(`TestModel.flibble is not a function`);
        });

        it('api metadata can define method with no additional args', () => {
            expect(() => {
                initialiseApiMeta(apiManager, TestModel, {
                    methods: {
                        testMethod: {
                            args: []
                        }
                    }
                });
            }).to.not.throw();
        });

        it('returns expected metadata for a method with args', () => {
            let testField = new f.TextField('arg1');
            let testField2 = new f.IntegerField('arg2');
            let meta = initialiseApiMeta(apiManager, TestModel, {
                methods: {
                    testMethod: {
                        args: [ testField, testField2 ]
                    }
                }
            });
            expect(meta.methods).to.deep.equal({
                testMethod: {
                    args: [ testField, testField2 ]
                }
            });
        });

        it('throws an error when method.args is not an array', () => {
            expect(() => {
                initialiseApiMeta(apiManager, TestModel, {
                    methods: {
                        testMethod: {
                            args: 'flibble' as any
                        }
                    }
                });
            }).to.throw(`args property must be an array of Field objects`);
        });

        it('throws an error when an invalid type is passed as a method arg', () => {
            expect(() => {
                initialiseApiMeta(apiManager, TestModel, {
                    methods: {
                        testMethod: {
                            args: [ 'flibble' as any ]
                        }
                    }
                });
            }).to.throw(`API method args must be an instance of Field`);
        });

        it('throws an error when method arg name is reserved', () => {
            let reservedField = new f.TextField('model');
            expect(() => {
                initialiseApiMeta(apiManager, TestModel, {
                    methods: {
                        testMethod: {
                            args: [ reservedField ]
                        }
                    }
                });
            }).to.throw(`arg name 'model' is reserved`);
        });
    });

    describe('general', () => {

        it('throws if apiMeta does not contain any operations or methods', () => {
            expect(() => {
                initialiseApiMeta(apiManager, TestModel, {});
            }).to.throw('No operations or methods defined for TestModel');
        });

    });

});
