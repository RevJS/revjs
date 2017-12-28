
import * as models from '../../__tests__/models.fixture';
import { ModelApiManager } from '../../../api/manager';

import { expect } from 'chai';
import { IApiMeta } from '../../../api/types';
import { GraphQLFieldConfigMap } from 'graphql';
import { getModelOperationMutations } from '../operations';

describe('getModelOperationMutations()', () => {

    describe('API with operations', () => {
        let api: ModelApiManager;
        let meta: IApiMeta;
        let config: GraphQLFieldConfigMap<any, any>;

        before(() => {
            api = new ModelApiManager(models.getModelManager());
            api.register(models.Post, { operations: ['create', 'read', 'update', 'remove'] });
            meta = api.getApiMeta('Post');
            config = getModelOperationMutations(api, meta);
        });

        it('should register all Post operations', () => {
            expect(config['Post_create']).to.exist;
            expect(config['Post_update']).to.exist;
            expect(config['Post_remove']).to.exist;
        });

        it('should not register Post_read operation', () => {
            expect(config['Post_read']).to.not.exist;
        });

        it('all operations should return type JSON', () => {
            expect(config['Post_create'].type.toString()).to.equal('JSON');
            expect(config['Post_update'].type.toString()).to.equal('JSON');
            expect(config['Post_remove'].type.toString()).to.equal('JSON');
        });

    });

});
