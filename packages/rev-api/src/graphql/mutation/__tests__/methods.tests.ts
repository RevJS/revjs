
import * as models from '../../__tests__/models.fixture';
import { fields } from 'rev-models';
import { ModelApiManager } from '../../../api/manager';

import { expect } from 'chai';
import { GraphQLFieldConfigMap } from 'graphql';
import { getModelMethodMutations } from '../methods';
import { IApiMeta } from '../../../api/meta';

describe('getModelMethodMutations()', () => {
    let api: ModelApiManager;
    let meta: IApiMeta;
    let config: GraphQLFieldConfigMap<any, any>;

    before(() => {
        api = new ModelApiManager(models.modelManager);
        api.register(models.Post, {
            methods: {
                postMethod1: {
                    validateModel: false,
                    args: [
                        new fields.TextField('arg1'),
                        new fields.IntegerField('arg2')
                    ]
                },
                postMethod2: {
                    validateModel: true,
                }
            }
        });
        meta = api.getApiMeta('Post');
        config = getModelMethodMutations(api, meta);
    });

    it('should register all Post methods', () => {
        expect(Object.keys(config)).to.have.length(2);
        expect(config['Post_postMethod1']).to.exist;
        expect(config['Post_postMethod2']).to.exist;
    });

    it('all method mutations should take a "model" arg.', () => {
        expect(config['Post_postMethod1'].args['model']).to.exist;
        expect(config['Post_postMethod2'].args['model']).to.exist;
    });

    it('all method "model" args should be of the Model_input type.', () => {
        expect(config['Post_postMethod1'].args['model'].type.toString()).to.contain('Post_input');
        expect(config['Post_postMethod2'].args['model'].type.toString()).to.contain('Post_input');
    });

    it('methods with validateModel=true should require the model parameter to be set', () => {
        expect(config['Post_postMethod2'].args['model'].type.toString().endsWith('!')).to.be.true;
    });

    it('methods with validateModel=false do not require the model parameter to be set', () => {
        expect(config['Post_postMethod1'].args['model'].type.toString().endsWith('!')).to.be.false;
    });

    it('all methods should have a return type of JSON', () => {
        expect(config['Post_postMethod1'].type.toString()).to.equal('JSON');
        expect(config['Post_postMethod2'].type.toString()).to.equal('JSON');
    });

    it('methods that do not require args should only have the "model" arg', () => {
        expect(Object.keys(config['Post_postMethod2'].args)).to.have.length(1);
        expect(config['Post_postMethod2'].args['model']).to.exist;
    });

    it('methods that require args should have the "model" arg plus the additional args', () => {
        expect(Object.keys(config['Post_postMethod1'].args)).to.have.length(3);
        expect(config['Post_postMethod1'].args['model']).to.exist;
        expect(config['Post_postMethod1'].args['arg1']).to.exist;
        expect(config['Post_postMethod1'].args['arg2']).to.exist;
    });

});
