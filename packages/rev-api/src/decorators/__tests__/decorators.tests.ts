
import { expect } from 'chai';
import { ApiOperations, ApiMethod } from '../decorators';

let ApiOperations_untyped: any = ApiOperations;

describe('Api Decorators', () => {

    function expectApiOperations(target: any, operations: any) {
        expect(target.prototype.__apiOperations).to.deep.equal(operations);
    }

    describe('ApiOperations decorator', () => {

        it('registers the passed operations', () => {
            @ApiOperations(['read', 'create'])
            class MyClass {
                test: string;
            }
            expectApiOperations(MyClass, ['read', 'create']);
        });

        it('allows an empty array', () => {
            @ApiOperations([])
            class MyClass {
                test: string;
            }
            expectApiOperations(MyClass, []);
        });

        it('throws if operations are not specified', () => {
            expect(() => {
                @ApiOperations_untyped()
                class MyClass {
                    test: string;
                }
                new MyClass();
            }).to.throw('ApiOperations decorator must be passed an array of allowed operations.');
        });

        it('throws if an invalid operation is specified', () => {
            expect(() => {
                @ApiOperations(['read', 'sneeze'])
                class MyClass {
                    test: string;
                }
                new MyClass();
            }).to.throw(`ApiOperations decorator error: 'sneeze' is not a supported operation.`);
        });

    });

    function expectApiMethod(target: any, methodName: string, meta: any) {
        expect(target.prototype.__apiMethods).to.be.an('object');
        expect(target.prototype.__apiMethods[methodName]).to.deep.equal(meta);
    }

    describe('ApiOperations decorator', () => {

        it('registers the decorated method with empty meta', () => {
            class MyClass {
                test: string;
                @ApiMethod()
                test_method() {}
            }
            expectApiMethod(MyClass, 'test_method', {});
        });

        it('registers the decorated method with passed meta', () => {
            class MyClass {
                test: string;
                @ApiMethod({ modelData: true })
                test_method() {}
            }
            expectApiMethod(MyClass, 'test_method', { modelData: true });
        });

        it('throws if decorated item is not a method', () => {
            expect(() => {
                class MyClass {
                    @ApiMethod()
                    test: string;
                }
                new MyClass();
            }).to.throw(`ApiMethod decorator error: 'test' is not a function.`);
        });

    });
});