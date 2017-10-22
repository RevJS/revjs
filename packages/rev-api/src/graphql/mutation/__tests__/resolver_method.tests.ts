
import { IntegerField, TextField, ModelOperationResult,
    ModelManager, IMethodContext, InMemoryBackend, fields
} from 'rev-models';
import { ModelApiManager } from '../../../api/manager';

import { expect } from 'chai';
import { IApiMeta } from '../../../api/meta';
import { getMethodResolver } from '../resolve_method';

let smellyArgs: any;

export class User {
    @IntegerField()
        id: number;
    @TextField()
        name: string;

    constructor(data?: any) {
        if (data) { Object.assign(this, data); }
    }

    getSmellyUser(ctx: IMethodContext<User>) {
        smellyArgs = arguments;
        this.name = this.name + ' smells!';
        ctx.result.result = this;
    }

    methodNoResult() {}
    methodValueResult() {
        return 'testValueResult';
    }
    methodOperationResult() {
        return new ModelOperationResult({
            operation: 'customOperation'
        });
    }
    methodWithError() {
        throw new Error('Oh noes!!!');
    }
}

describe('getMethodResolver()', () => {
    let models: ModelManager;
    let api: ModelApiManager;

    before(() => {
        models = new ModelManager();
        models.registerBackend('default', new InMemoryBackend());
        models.register(User);
    });

    function registerUserApi(apiMeta?: IApiMeta) {
        if (!apiMeta) {
            apiMeta = {
                methods: {
                    getSmellyUser: {
                        modelArg: false,
                    }
                }
            };
        }
        api = new ModelApiManager(models);
        api.register(User, apiMeta);
    }

    function getResolver() {
        return getMethodResolver(api, 'User', 'getSmellyUser');
    }

    describe('meta.validateModel - when truthy', () => {

        beforeEach(() => {
            registerUserApi({
                methods: {
                    getSmellyUser: {
                        modelArg: true,
                    }
                }
            });
        });

        it('throws an error if model not set', () => {
            let resolver = getResolver();
            return resolver(undefined, undefined)
            .then((res) => { throw new Error('did not throw'); })
            .catch((res) => {
                expect(res.message).to.contain('Argument "model" must be an object');
            });
        });

        it('throws an error if model is not an object', () => {
            let resolver = getResolver();
            return resolver(undefined, { model: 'Not an object'})
            .then((res) => { throw new Error('did not throw'); })
            .catch((res) => {
                expect(res.message).to.contain('Argument "model" must be an object');
            });
        });

        it('returns an unsuccessful result if model fails validation', () => {
            let resolver = getResolver();
            let model: Partial<User> = {
                id: 1,
                name: ''
            };
            return resolver(undefined, { model: model})
            .then((res) => {
                expect(res.success).to.be.false;
                expect(res.operation.operation).to.equal('getSmellyUser');
                expect(res.errors[0].code).to.equal('validation_error');
                expect(res.validation.fieldErrors['name'][0].code).to.equal('string_empty');
            });
        });

        it('returns successful result when model passes validation', () => {
            let resolver = getResolver();
            let model: Partial<User> = {
                id: 1,
                name: 'Bob'
            };
            return resolver(undefined, { model: model })
            .then((res) => {
                expect(res.success).to.be.true;
            });
        });

    });

    describe('meta.validateModel - when falsy', () => {

        beforeEach(() => {
            registerUserApi({
                methods: {
                    getSmellyUser: {
                        modelArg: false,
                    }
                }
            });
        });

        it('returns an successful result for an invalid model', () => {
            let resolver = getResolver();
            let model: Partial<User> = {
                id: 'not_a_number' as any,
                name: 'Jim'
            };
            return resolver(undefined, { model: model})
            .then((res) => {
                expect(res.success).to.be.true;
            });
        });

        it('returns successful result when model is valid', () => {
            let resolver = getResolver();
            let model: Partial<User> = {
                id: 1,
                name: 'Bob'
            };
            return resolver(undefined, { model: model })
            .then((res) => {
                expect(res.success).to.be.true;
            });
        });

    });

    describe('method calls and results - without method arguments', () => {

        beforeEach(() => {
            registerUserApi({ methods: {
                getSmellyUser: {},
                methodNoResult: {},
                methodValueResult: {},
                methodOperationResult: {},
                methodWithError: {}
            }});
        });

        it('runs the custom method and returns expected result', () => {
            let resolver = getResolver();
            return resolver(undefined, {
                model: {
                    id: 23,
                    name: 'Timothy'
                }
            })
            .then((res) => {
                expect(res.success).to.be.true;
                expect(res.result).to.deep.equal(new User({
                    id: 23,
                    name: 'Timothy smells!'
                }));
            });
        });

        it('custom method called with expected IMethodContext arg', () => {
            let resolver = getResolver();
            return resolver(undefined, {
                model: {
                    id: 23,
                    name: 'Timothy'
                },
                extraArg: 'test'
            })
            .then((res) => {
                expect(smellyArgs).to.have.length(1);
                expect(smellyArgs[0]).to.have.property('manager', models);
                expect(smellyArgs[0]).to.have.property('result');
                expect(smellyArgs[0].result).to.have.property('operation');
                expect(smellyArgs[0].result.operation).to.have.property('operation', 'getSmellyUser');
                expect(smellyArgs[0].args).to.deep.equal({});
            });
        });

        it('method that returns no result still responds with a successful ModelOperationResult', () => {
            let resolver = getMethodResolver(api, 'User', 'methodNoResult');
            return resolver(undefined, {})
            .then((res) => {
                expect(res).to.be.instanceof(ModelOperationResult);
                expect(res.success).to.be.true;
                expect(res.result).to.be.undefined;
            });
        });

        it('method that returns a value has it wrapped in a ModelOperationResult', () => {
            let resolver = getMethodResolver(api, 'User', 'methodValueResult');
            return resolver(undefined, {})
            .then((res) => {
                expect(res).to.be.instanceof(ModelOperationResult);
                expect(res.success).to.be.true;
                expect(res.result).to.equal('testValueResult');
            });
        });

        it('method that returns a ModelOperationResult returns it directly', () => {
            let resolver = getMethodResolver(api, 'User', 'methodOperationResult');
            return resolver(undefined, {})
            .then((res) => {
                expect(res).to.be.instanceof(ModelOperationResult);
                expect(res.success).to.be.true;
                expect(res.operation.operation).to.equal('customOperation');
            });
        });

        it('method that throws an error has it bubbled up', () => {
            let resolver = getMethodResolver(api, 'User', 'methodWithError');
            return resolver(undefined, {})
            .then((res) => { throw new Error('expected to throw'); })
            .catch((err) => {
                expect(err.message).to.equal('Oh noes!!!');
            });
        });

    });

    describe('method calls - with method arguments', () => {

        beforeEach(() => {
            registerUserApi({ methods: {
                getSmellyUser: {
                    args: [
                        new fields.TextField('textArg'),
                        new fields.IntegerField('intArg', { required: false })
                    ]
                }
            }});
        });

        it('runs the custom method and returns expected result', () => {
            let resolver = getResolver();
            return resolver(undefined, {
                model: {
                    id: 23,
                    name: 'Timothy'
                },
                textArg: 'test'
            })
            .then((res) => {
                expect(res.success).to.be.true;
                expect(res.result).to.deep.equal(new User({
                    id: 23,
                    name: 'Timothy smells!'
                }));
            });
        });

        it('custom method called with appropriate IMethodContext arg', () => {
            let resolver = getResolver();
            return resolver(undefined, {
                model: {
                    id: 23,
                    name: 'Timothy'
                },
                textArg: 'test'
            })
            .then((res) => {
                expect(smellyArgs).to.have.length(1);
                expect(smellyArgs[0]).to.have.property('manager', models);
                expect(smellyArgs[0]).to.have.property('result');
                expect(smellyArgs[0].args).to.deep.equal({
                    textArg: 'test',
                    intArg: undefined
                });
            });

        });

    });

});
