
import * as models from '../../__tests__/models.fixture';
import { fields } from 'rev-models';
import { ModelApiManager } from '../../../api/manager';

import { expect } from 'chai';
import { GraphQLFieldConfigMap } from 'graphql';
import { getModelMethodMutations } from '../methods';
import { IApiMeta } from '../../../api/types';

describe('getModelMethodMutations()', () => {
    let api: ModelApiManager;
    let meta: IApiMeta;
    let config: GraphQLFieldConfigMap<any, any>;

    before(() => {
        api = new ModelApiManager(models.getModelManager());
        api.register(models.Post, {
            methods: {
                postMethod1: {
                    modelData: false,
                    args: [
                        new fields.TextField('arg1'),
                        new fields.IntegerField('arg2')
                    ]
                },
                postMethod2: {
                    modelData: true,
                },
                postMethod3: {}
            }
        });
        meta = api.getApiMeta('Post');
        config = getModelMethodMutations(api, meta);
    });

    it('should register all Post methods', () => {
        expect(Object.keys(config)).to.have.length(3);
        expect(config['Post_postMethod1']).to.exist;
        expect(config['Post_postMethod2']).to.exist;
        expect(config['Post_postMethod3']).to.exist;
    });

    it('methods with modelData=true should have a required model parameter', () => {
        expect(config['Post_postMethod2'].args['model'].type.toString().endsWith('!')).to.be.true;
    });

    it('methods with modelData=false should not have a model parameter', () => {
        expect(config['Post_postMethod1'].args['model']).not.to.exist;
    });

    it('method "model" args should be of the Model_input type.', () => {
        expect(config['Post_postMethod2'].args['model'].type.toString()).to.contain('Post_input');
    });

    it('all methods should have a return type of JSON', () => {
        expect(config['Post_postMethod1'].type.toString()).to.equal('JSON');
        expect(config['Post_postMethod2'].type.toString()).to.equal('JSON');
    });

    it('methods that do not require args should not register args', () => {
        expect(Object.keys(config['Post_postMethod3'].args)).to.have.length(0);
    });

    it('methods that only require the "model" arg should register as expected', () => {
        expect(Object.keys(config['Post_postMethod2'].args)).to.have.length(1);
        expect(config['Post_postMethod2'].args['model']).to.exist;
    });

    it('methods that only require custom args should register as expected', () => {
        expect(Object.keys(config['Post_postMethod1'].args)).to.have.length(2);
        expect(config['Post_postMethod1'].args['arg1']).to.exist;
        expect(config['Post_postMethod1'].args['arg2']).to.exist;
    });

    it('methods should define a resolve function', () => {
        expect(config['Post_postMethod1'].resolve).to.be.a('function');
    });

});
