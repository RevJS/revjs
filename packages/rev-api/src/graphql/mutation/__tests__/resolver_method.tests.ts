
import { IntegerField, TextField,
    ModelManager, IMethodContext, InMemoryBackend
} from 'rev-models';
import { ModelApiManager } from '../../../api/manager';

import { expect } from 'chai';
import { IApiMeta } from '../../../api/meta';
import { getMethodResolver } from '../resolve_method';

export class User {
    @IntegerField()
        id: number;
    @TextField()
        name: string;

    getSmellyUser(ctx: IMethodContext<User>) {
        this.name = this.name + ' smells!';
        ctx.result.result = this;
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
                        validateModel: false,
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
                        validateModel: true,
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
                        validateModel: false,
                    }
                }
            });
        });

        it('returns an successful result for an invalid model', () => {
            let resolver = getResolver();
            let model: Partial<User> = {
                id: 'not_a_number' as any,
                name: null
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

});
