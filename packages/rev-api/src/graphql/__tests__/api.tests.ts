
import * as models from '../__fixtures__/models';
import { ModelApiManager } from '../../api/manager';
import { GraphQLApi } from '../api';
import { GraphQLFloat } from 'graphql/type/scalars';
import { fields } from 'rev-models';

import { expect } from 'chai';

describe('GraphQLApi class', () => {
    let manager: ModelApiManager;
    let api: GraphQLApi;

    beforeEach(() => {
        manager = new ModelApiManager(models.getModelManager());
    });

    describe('constructor()', () => {

        it('successfully creates a manager', () => {
            expect(() => {
                api = new GraphQLApi(manager);
            }).to.not.throw();
            expect(api.getApiManager()).to.equal(manager);
        });

        it('throws if not passed a ModelManager', () => {
            expect(() => {
                api = new GraphQLApi(null);
            }).to.throw('Invalid ModelApiManager passed in constructor');
        });

    });

    describe('getGraphQLFieldMapping()', () => {
        class UnknownField extends fields.Field {}

        before(() => {
            api = new GraphQLApi(manager);
        });

        it('returns mapping for a known field type', () => {
            const mapping = api.getGraphQLFieldMapping(new fields.NumberField('test'));
            expect(mapping).to.be.an('object');
            expect(mapping.type).to.equal(GraphQLFloat);
            expect(mapping.converter).to.be.a('function');
        });

        it('throws an error when called with an unknown field type', () => {
            expect(() => {
                api.getGraphQLFieldMapping(new UnknownField('test'));
            }).to.throw(`No fieldMapping found for field type 'UnknownField'`);
        });

    });

});
