
import * as models from '../../__tests__/models.fixture';

import { expect } from 'chai';
import { GraphQLObjectTypeConfig } from 'graphql';
import { getModelConfig } from '../model';
import { IModelMeta } from 'rev-models';

describe('getModelConfig()', () => {
    let config: GraphQLObjectTypeConfig<any, any>;
    let userMeta: IModelMeta<models.User>;

    before(() => {
        userMeta = models.getModelManager().getModelMeta(models.User);
        config = getModelConfig(userMeta);
    });

    it('should set type name to meta.name', () => {
        expect(config.name).to.equal(userMeta.name);
    });

    it('should register all model fields', () => {
        for (let field of userMeta.fields) {
            expect(config.fields).to.have.property(field.name);
        }
    });

});
