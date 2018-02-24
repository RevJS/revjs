
import { IntegerField, TextField, ModelOperationResult,
    ModelManager, IMethodContext, InMemoryBackend, fields
} from 'rev-models';
import { ModelApiManager } from '../../../api/manager';

import { expect } from 'chai';
import { IApiMeta } from '../../../api/types';
import { getMethodResolver } from '../resolve_method';

let smellyInstanceProps: any;
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
        // Record values for tests
        smellyInstanceProps = {
            id: this.id,
            name: this.name
        };
        if (this['extra_prop']) {
            smellyInstanceProps.extra_prop = this['extra_prop'];
        }
        smellyArgs = arguments;
        // Do the thing
        this.name = this.name + ' smells!';
        ctx.result.result = this;
    }

    methodNoResult() {}
    methodValueResult() {
        return 'testValueResult';
    }
    methodOperationResult() {
        return new ModelOperationResult({
            operationName: 'customOperation'
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

    beforeEach(() => {
        smellyInstanceProps = undefined;
        smellyArgs = undefined;
    });

    function registerUserApi(apiMeta?: IApiMeta) {
        if (!apiMeta) {
            apiMeta = {
                methods: {
                    getSmellyUser: {
                        modelData: false,
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

    describe('method calls and results - with model data', () => {

        beforeEach(() => {
            registerUserApi({ methods: {
                getSmellyUser: {
                    modelData: true
                },
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

        it('method received expected IMethodContext arg and model data', () => {
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
                expect(smellyArgs[0].result.operation).to.have.property('operationName', 'getSmellyUser');
                expect(smellyArgs[0].result).to.have.property('success', true);
                expect(smellyArgs[0].args).to.deep.equal({});
                expect(smellyInstanceProps).to.deep.equal({
                    id: 23,
                    name: 'Timothy'
                });
            });
        });

        it('method does not receive any extra fields passed for the model', () => {
            let resolver = getResolver();
            return resolver(undefined, {
                model: {
                    id: 12,
                    name: 'Joe',
                    extra_prop: 'Flibble'
                }
            })
            .then((res) => {
                expect(smellyInstanceProps).to.deep.equal({
                    id: 12,
                    name: 'Joe'
                });
            });
        });

        it('method can receive a partial set of model fields', () => {
            let resolver = getResolver();
            return resolver(undefined, {
                model: {
                    id: 12,
                }
            })
            .then((res) => {
                expect(smellyInstanceProps).to.deep.equal({
                    id: 12,
                    name: undefined
                });
            });
        });

        it('method can receive invalid values for model fields', () => {
            let resolver = getResolver();
            return resolver(undefined, {
                model: {
                    id: 'Oooh er!',
                    name: null
                }
            })
            .then((res) => {
                expect(smellyInstanceProps).to.deep.equal({
                    id: 'Oooh er!',
                    name: null
                });
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
                expect(res.operation.operationName).to.equal('customOperation');
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
                    modelData: false,
                    args: [
                        new fields.TextField('textArg'),
                        new fields.IntegerField('intArg', { required: false })
                    ]
                }
            }});
        });

        it('custom method called with expected IMethodContext args', () => {
            let resolver = getResolver();
            return resolver(undefined, {
                textArg: 'test',
                intArg: 21
            })
            .then((res) => {
                expect(smellyArgs).to.have.length(1);
                expect(smellyArgs[0]).to.have.property('manager', models);
                expect(smellyArgs[0]).to.have.property('result');
                expect(smellyArgs[0].args).to.deep.equal({
                    textArg: 'test',
                    intArg: 21
                });
            });
        });

        it('custom method still called when optional arg not set', () => {
            let resolver = getResolver();
            return resolver(undefined, {
                textArg: 'test'
            })
            .then((res) => {
                expect(smellyArgs).to.have.length(1);
                expect(smellyArgs[0].args).to.deep.equal({
                    textArg: 'test',
                    intArg: undefined
                });
            });
        });

        it('validation error returned when required arg not set', () => {
            let resolver = getResolver();
            return resolver(undefined, undefined)
            .then((res) => {
                expect(smellyArgs).to.be.undefined; // not called
                expect(res.success).to.be.false;
                expect(res.errors[0].code).to.equal('invalid_args');
                expect(res.validation.fieldErrors['textArg'][0].code).to.equal('required');
            });
        });

        it('validation error returned when arg fails validation', () => {
            let resolver = getResolver();
            return resolver(undefined, {
                textArg: 'test',
                intArg: 'test'
            })
            .then((res) => {
                expect(smellyArgs).to.be.undefined; // not called
                expect(res.success).to.be.false;
                expect(res.errors[0].code).to.equal('invalid_args');
                expect(res.validation.fieldErrors['intArg'][0].code).to.equal('not_a_number');
            });
        });

    });

    describe('method calls - with model data and arguments', () => {

        beforeEach(() => {
            registerUserApi({ methods: {
                getSmellyUser: {
                    modelData: true,
                    args: [
                        new fields.TextField('textArg'),
                    ]
                }
            }});
        });

        it('custom method called with model data and expected IMethodContext args', () => {
            let resolver = getResolver();
            return resolver(undefined, {
                model: {
                    name: 'Bob'
                },
                textArg: 'test'
            })
            .then((res) => {
                expect(smellyArgs).to.have.length(1);
                expect(smellyArgs[0]).to.have.property('manager', models);
                expect(smellyArgs[0]).to.have.property('result');
                expect(smellyArgs[0].args).to.deep.equal({
                    textArg: 'test'
                });
                expect(res.result.name).to.equal('Bob smells!');
            });
        });

    });

    describe('method calls - with no arguments', () => {

        beforeEach(() => {
            registerUserApi({ methods: {
                getSmellyUser: {}
            }});
        });

        it('custom method called with no model data or args', () => {
            let resolver = getResolver();
            return resolver(undefined, undefined)
            .then((res) => {
                expect(smellyArgs).to.have.length(1);
                expect(smellyArgs[0]).to.have.property('manager', models);
                expect(smellyArgs[0]).to.have.property('result');
                expect(smellyArgs[0].args).to.deep.equal({});
                expect(smellyInstanceProps).to.deep.equal({
                    id: undefined,
                    name: undefined
                });
            });
        });

    });
});
