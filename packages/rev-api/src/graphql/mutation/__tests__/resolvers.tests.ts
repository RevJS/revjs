
import { IntegerField, TextField,
    ModelManager, IMethodContext, InMemoryBackend
} from 'rev-models';
import { ModelApiManager } from '../../../api/manager';

import { expect } from 'chai';
import { IApiMeta } from '../../../api/meta';
import { getMethodResolver } from '../resolvers';

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

describe('rev-api resolvers', () => {
    let models: ModelManager;
    let api: ModelApiManager;
    let meta: IApiMeta;

    before(() => {
        models = new ModelManager();
        models.registerBackend('default', new InMemoryBackend());
        models.register(User);

        api = new ModelApiManager(models);
        api.register(User, {
            methods: {
                getSmellyUser: {
                    validateModel: true,
                }
            }
        });
        meta = api.getApiMeta('User');
    });

    function getResolver() {
        return getMethodResolver('getSmellyUser', meta.methods.getSmellyUser);
    }

    describe('getMethodResolver()', () => {

        it('returns successful result if all is well', () => {
            let resolver = getResolver();
            let model: Partial<User> = {
                id: 1,
                name: 'Bob'
            };
            let result = resolver(undefined, { model: model });
            expect(result).to.have.property('success', true);
        });

        it('meta.validateModel - when truthy, throws an error if model not set', () => {
            let resolver = getResolver();
            expect(() => {
                resolver(undefined, undefined);
            }).to.throw('Argument "model" must be an object');
        });

        it('meta.validateModel - when truthy, throws an error if model ia not an object', () => {
            let resolver = getResolver();
            expect(() => {
                resolver(undefined, { model: 'Not an object'});
            }).to.throw('Argument "model" must be an object');
        });

    });

});
