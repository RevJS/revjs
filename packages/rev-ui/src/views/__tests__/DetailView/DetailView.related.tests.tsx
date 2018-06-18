
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as sinon from 'sinon';
import * as models from '../../../__fixtures__/models';
import { createData, IModelTestData } from '../../../__fixtures__/modeldata';
import { expect } from 'chai';
import * as rev from 'rev-models';
import { mount /*, ReactWrapper */ } from 'enzyme';
import { ModelProvider } from '../../../provider/ModelProvider';
import {
    DetailView, IDetailViewContext, /*, IDetailViewProps */
    RELATED_MODEL_VALIDATION_ERROR_MSG,
    RELATED_MODEL_VALIDATION_ERROR_CODE
} from '../../DetailView';
import { sleep } from '../../../__test_utils__/utils';
// import { ModelValidationResult } from 'rev-models/lib/validation/validationresult';
import { ModelOperationResult } from 'rev-models/lib/operations/operationresult';

describe('DetailView with RelatedModel field data', () => {

    describe('construction', () => {
        let modelManager: rev.ModelManager;
        let errorStub: sinon.SinonStub;

        beforeEach(() => {
            modelManager = models.getModelManager();
            errorStub = sinon.stub(console, 'error');
        });

        afterEach(() => {
            errorStub.restore();
        });

        it('throws error when "related" prop is not an array of strings', () => {
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                    <DetailView model="Post" related={'test' as any} />
                </ModelProvider>);
            }).to.throw('related prop must be an array of field names');
        });

        it('throws error when "related" prop contains an invalid field name', () => {
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                    <DetailView model="Post" related={['test']} />
                </ModelProvider>);
            }).to.throw(`invalid RelatedModel field name 'test' for model 'Post'`);
        });

    });

    let receivedDetailViewContext: IDetailViewContext;
    let renderCount: number;

    class TestView extends React.Component {
        static contextTypes = {
            modelManager: PropTypes.object,
            detailViewContext: PropTypes.object
        };
        constructor(props: any, context: any) {
            super(props, context);
            receivedDetailViewContext = this.context.detailViewContext;
        }
        render() {
            renderCount++;
            return <p>SpyComponent</p>;
        }
    }

    function resetTestView() {
        receivedDetailViewContext = null as any;
        renderCount = 0;
    }

    describe('when primaryKeyValue is not specified and related fields are specified', () => {
        let modelManager: rev.ModelManager;
        let ctx: IDetailViewContext<rev.IModel>;

        before(() => {
            resetTestView();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post" related={['user']}>
                        <TestView />
                    </DetailView>
                </ModelProvider>
            );
            ctx = receivedDetailViewContext;
        });

        it('passes detailViewContext to contained Views', () => {
            expect(ctx).not.to.be.null;
        });

        it('does not trigger a data load', () => {
            expect(ctx.loadState).to.equal('NONE');
        });

        it('a model instance is created for each "related" model field', () => {
            expect(ctx.model!.user).not.to.be.null;
            expect(ctx.model!.user).to.be.instanceof(models.User);
            expect(modelManager.isNew(ctx.model!.user)).to.be.true;
        });

        it('relatedModelMeta is set', () => {
            expect(ctx.relatedModelMeta['user']).to.deep.equal(modelManager.getModelMeta('User'));
        });

        it('validation information is null', () => {
            expect(ctx.validation).to.be.null;
        });

        it('dirty is false', () => {
            expect(ctx.dirty).to.be.false;
        });

    });

    describe('detailViewContext after successful model load', () => {
        let modelManager: rev.ModelManager;
        let expectedData: IModelTestData;

        before(async () => {
            resetTestView();
            modelManager = models.getModelManager();
            expectedData = await createData(modelManager);
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post" primaryKeyValue="1" related={['user']}>
                        <TestView />
                    </DetailView>
                </ModelProvider>
            );
            await sleep(10);
        });

        it('component has rendered twice', () => {
            expect(renderCount).to.equal(2);
        });

        it('loadState is set back to NONE', () => {
            expect(receivedDetailViewContext.loadState).to.equal('NONE');
        });

        it('related model data is the requested model instance', () => {
            const ctx = receivedDetailViewContext;
            expect(ctx.model!.user).to.be.instanceof(models.User);
            expect(ctx.model!.user.id).to.equal(expectedData.posts[0].user.id);
            expect(ctx.model!.user.name).to.equal(expectedData.posts[0].user.name);
        });

        it('relatedModelMeta is set', () => {
            const ctx = receivedDetailViewContext;
            expect(ctx.relatedModelMeta['user']).to.deep.equal(modelManager.getModelMeta('User'));
        });

        it('validation information is null', () => {
            expect(receivedDetailViewContext.validation).to.be.null;
        });

        it('dirty is false', () => {
            expect(receivedDetailViewContext.dirty).to.be.false;
        });

    });

    // describe('validate()', () => {
    //     let modelManager: rev.ModelManager;

    //     before(() => {
    //         resetTestView();
    //         modelManager = models.getModelManager();
    //         mount(
    //             <ModelProvider modelManager={modelManager}>
    //                 <DetailView model="Post">
    //                     <TestView />
    //                 </DetailView>
    //             </ModelProvider>
    //         );
    //     });

    //     it('validate() is passed in detailViewContext', () => {
    //         expect(receivedDetailViewContext.validate).to.be.a('function');
    //     });

    //     it('detailViewContext.validation is null by default', () => {
    //         expect(receivedDetailViewContext.validation).to.be.null;
    //     });

    //     it('initial render has completed', () => {
    //         expect(renderCount).to.equal(1);
    //     });

    //     it('validate() triggers validation of the model, re-renders, and returns result', async () => {
    //         let result = await receivedDetailViewContext.validate();
    //         expect(result).to.be.instanceof(ModelValidationResult);
    //         expect(receivedDetailViewContext.validation).to.equal(result);
    //         expect(renderCount).to.equal(2);
    //     });

    // });

    describe('save()', () => {
        let modelManager: rev.ModelManager;

        beforeEach(() => {
            resetTestView();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post" related={['user']}>
                        <TestView />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('detailViewContext.validation is null by default', () => {
            expect(receivedDetailViewContext.validation).to.be.null;
        });

        it('initial render has completed', () => {
            expect(renderCount).to.equal(1);
        });

        describe('when related model is not valid', () => {

            it('save() triggers validation of the model, re-renders, and returns validation error', async () => {
                receivedDetailViewContext.model = new models.Post({
                    id: 1, title: 'Valid New Post', body: 'Posty Posty...',
                    user: new models.User()
                });
                try {
                    await receivedDetailViewContext.save();
                    throw new Error('should have thrown');
                }
                catch (e) {
                    expect(e).to.be.instanceof(rev.ValidationError);
                    expect(e.result).to.be.instanceof(ModelOperationResult);
                    const relValidation = e.result.validation;
                    const ctxValid = receivedDetailViewContext.validation;
                    expect(ctxValid!.valid).to.be.false;
                    expect(ctxValid!.fieldErrors).to.have.keys('user');
                    expect(ctxValid!.fieldErrors['user']).to.have.length(1);
                    const userError = ctxValid!.fieldErrors['user'][0];
                    expect(userError.message).to.equal(RELATED_MODEL_VALIDATION_ERROR_MSG);
                    expect(userError.code).to.equal(RELATED_MODEL_VALIDATION_ERROR_CODE);
                    expect(userError.validation).to.equal(relValidation);
                    expect(renderCount).to.equal(2);
                }
            });

        });

        describe('when related model is valid, and is a new record', () => {

            it('save() triggers creation of the models, adds ID to the parent model, re-renders, and returns operation results', async () => {
                receivedDetailViewContext.model = new models.Post({
                    title: 'Valid New Post', body: 'Posty Posty...',
                    user: new models.User({ name: 'New User Dude' })
                });
                const result = await receivedDetailViewContext.save();
                expect(result).to.be.instanceof(ModelOperationResult);
                expect(result.operation.operationName).to.equal('create');
                expect(result.success).to.be.true;
                expect(result.result).to.be.instanceof(models.Post);
                expect(result.result!.id).to.be.a('number');
                expect(receivedDetailViewContext.model.id).to.be.a('number');
                expect(receivedDetailViewContext.validation).to.equal(result.validation);
                const relResult = result.meta['relatedResults'];
                expect(relResult).to.have.key('user');
                expect(relResult['user']).to.be.instanceof(ModelOperationResult);
                expect(relResult['user'].operation.operationName).to.equal('create');
                expect(relResult['user'].success).to.be.true;

                const createdPostWithUser = await modelManager.read(models.Post, {
                    where: {
                        id: result!.result!.id
                    },
                    related: ['user']
                });
                expect(createdPostWithUser.results![0].user.name).to.equal('New User Dude');
                expect(renderCount).to.equal(2);
            });

        });

        describe('when related model is valid, and is an updated record', () => {

            it('save() triggers update of the model, re-renders, and returns operation result', async () => {
                receivedDetailViewContext.model = new models.Post({
                    id: 100, title: 'Valid New Post', body: 'Posty Posty...',
                    user: new models.User({ id: 200, name: 'New Name'})
                });
                const result = await receivedDetailViewContext.save();
                expect(result).to.be.instanceof(ModelOperationResult);
                expect(result.operation.operationName).to.equal('update');
                expect(result.operation.where).to.deep.equal({ id: 100 });
                expect(result.success).to.be.true;
                expect(receivedDetailViewContext.validation).to.equal(result.validation);
                const relResult = result.meta['relatedResults'];
                expect(relResult).to.have.key('user');
                expect(relResult['user']).to.be.instanceof(ModelOperationResult);
                expect(relResult['user'].operation.operationName).to.equal('update');
                expect(relResult['user'].operation.where).to.deep.equal({ id: 200 });
                expect(relResult['user'].success).to.be.true;
                expect(renderCount).to.equal(2);
            });

        });

    });

    // describe('remove()', () => {
    //     let modelManager: rev.ModelManager;

    //     beforeEach(() => {
    //         resetTestView();
    //         modelManager = models.getModelManager();
    //         mount(
    //             <ModelProvider modelManager={modelManager}>
    //                 <DetailView model="Post">
    //                     <TestView />
    //                 </DetailView>
    //             </ModelProvider>
    //         );
    //     });

    //     it('remove() is passed in detailViewContext', () => {
    //         expect(receivedDetailViewContext.save).to.be.a('function');
    //     });

    //     it('initial render has completed', () => {
    //         expect(renderCount).to.equal(1);
    //     });

    //     describe('when model has no primary key', () => {

    //         beforeEach(() => {
    //             const meta = modelManager.getModelMeta(models.Post);
    //             meta.primaryKey = undefined;
    //         });

    //         it('remove() throws an error and does not rerender', async () => {
    //             try {
    //                 await receivedDetailViewContext.remove();
    //                 throw new Error('should have thrown');
    //             }
    //             catch (e) {
    //                 expect(e).to.be.instanceof(Error);
    //                 expect(e.message).to.equal(`DetailView Error: Cannot remove record for model 'Post' because it doesn't have a primaryKey field defined.`);
    //             }

    //             expect(renderCount).to.equal(1);
    //         });

    //     });

    //     describe('when model is a new record', () => {

    //         it('remove() throws an error', async () => {
    //             receivedDetailViewContext.model = new models.Post({
    //                 title: 'Valid New Post', body: 'Posty Posty...'
    //             });
    //             try {
    //                 await receivedDetailViewContext.remove();
    //                 throw new Error('should have thrown');
    //             }
    //             catch (e) {
    //                 expect(e).to.be.instanceof(Error);
    //                 expect(e.message).to.equal('Cannot call remove() on a new model record.');
    //             }
    //         });

    //     });

    //     describe('when model is an existing record', () => {

    //         it('remove() triggers removal of the model, re-renders, and returns operation result', async () => {
    //             receivedDetailViewContext.model = new models.Post({
    //                 id: 100, title: 'Valid New Post', body: 'Posty Posty...'
    //             });
    //             const result = await receivedDetailViewContext.remove();

    //             expect(result).to.be.instanceof(ModelOperationResult);
    //             expect(result.operation.operationName).to.equal('remove');
    //             expect(result.operation.where).to.deep.equal({ id: 100 });
    //             expect(result.success).to.be.true;

    //             expect(renderCount).to.equal(2);
    //             expect(receivedDetailViewContext.model).to.deep.equal(new models.Post());
    //             expect(receivedDetailViewContext.validation).to.equal(null);
    //             expect(receivedDetailViewContext.dirty).to.equal(false);

    //         });

    //     });

    // });

    // describe('refresh()', () => {
    //     let modelManager: rev.ModelManager;

    //     before(() => {
    //         resetTestView();
    //         modelManager = models.getModelManager();
    //         mount(
    //             <ModelProvider modelManager={modelManager}>
    //                 <DetailView model="Post">
    //                     <TestView />
    //                 </DetailView>
    //             </ModelProvider>
    //         );
    //     });

    //     it('refresh() is passed in detailViewContext', () => {
    //         expect(receivedDetailViewContext.refresh).to.be.a('function');
    //     });

    //     it('initial render has completed', () => {
    //         expect(renderCount).to.equal(1);
    //     });

    //     it('calling refresh() forces a re-render', () => {
    //         receivedDetailViewContext.refresh();
    //         expect(renderCount).to.equal(2);
    //     });

    // });

    // describe('rendering', () => {
    //     let modelManager: rev.ModelManager;
    //     let wrapper: ReactWrapper;

    //     before(() => {
    //         modelManager = models.getModelManager();
    //         wrapper = mount(
    //             <ModelProvider modelManager={modelManager}>
    //                 <DetailView model="Post">
    //                     <span>content</span>
    //                 </DetailView>
    //             </ModelProvider>
    //         );
    //     });

    //     it('renders children directly', () => {
    //         expect(wrapper.at(0).text()).to.equal('content');
    //     });

    // });

    // describe('Standard Component Properties', () => {
    //     let modelManager: rev.ModelManager;
    //     let receivedProps: IDetailViewProps;

    //     const SpyComponent = (props: any) => {
    //         receivedProps = props;
    //         return <p>SpyComponent</p>;
    //     };

    //     before(() => {
    //         receivedProps = null as any;
    //         modelManager = models.getModelManager();
    //         mount(
    //             <ModelProvider modelManager={modelManager}>
    //                 <DetailView
    //                     model="Post"
    //                     component={SpyComponent}
    //                     style={{marginTop: 10}}
    //                 />
    //             </ModelProvider>
    //         );
    //     });

    //     it('style prop is passed to rendered component', () => {
    //         expect(receivedProps.style).to.deep.equal({marginTop: 10});
    //     });

    // });

    /**
     * TODO
     *  - test when a slow load completes during a save
     *     OR make sure you cant save during a load
     */
});