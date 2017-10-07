
import * as models from '../../__tests__/models.fixture';

import { expect } from 'chai';
import { GraphQLObjectTypeConfig } from 'graphql';
import { getModelConfig } from '../model';

describe('getModelGraphQLType()', () => {
    let config: GraphQLObjectTypeConfig<any, any>;

    before(() => {
        config = getModelConfig(models.UserMeta);
    });

    it('should set type name to meta.name', () => {
        expect(config.name).to.equal(models.UserMeta.name);
    });

    it('should register all model fields', () => {
        for (let field of models.UserMeta.fields) {
            expect(config.fields).to.have.property(field.name);
        }
    });

});
