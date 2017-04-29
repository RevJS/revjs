
import * as models from './models.fixture';
import { ModelApiRegistry } from '../../registry/registry';
import { getGraphQLSchema } from '../schema';

import { expect } from 'chai';

describe('getGraphQLSchema()', () => {

    describe('query{} - API with no readable models', () => {
        let api: ModelApiRegistry;

        before(() => {
            api = new ModelApiRegistry(models.modelRegistry);
        });

        it('should not have any models available for read', () => {
            let readModels = api.getModelNamesByOperation('read');
            expect(readModels.length).to.equal(0);
        });

        it('should register the root query{} type', () => {
            let schema = getGraphQLSchema(api);
            expect(schema.getQueryType()).to.exist;
        });

        it('should register a single no_models field', () => {
            let schema = getGraphQLSchema(api);
            let queryFields = schema.getQueryType().getFields();
            let fieldNames = Object.keys(queryFields);
            expect(fieldNames).to.deep.equal(['no_models']);
        });

        it('no_models field should return a static string', () => {
            let schema = getGraphQLSchema(api);
            let queryFields = schema.getQueryType().getFields();
            expect(queryFields.no_models.type.toString()).to.equal('String');
            expect((queryFields.no_models as any).resolve()).to.equal('No models have been registered for read access');
        });

    });

});
