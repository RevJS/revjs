
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as sinon from 'sinon';
import * as models from '../../../__fixtures__/models';
import { createData, IModelTestData } from '../../../__fixtures__/modeldata';
import { expect } from 'chai';
import * as rev from 'rev-models';
import { mount, ReactWrapper } from 'enzyme';
import { ModelProvider } from '../../../provider/ModelProvider';
import { DetailView, IDetailViewContext, IDetailViewProps } from '../../DetailView';
import { sleep } from '../../../__test_utils__/utils';
import { ModelValidationResult } from 'rev-models/lib/validation/validationresult';
import { ModelOperationResult } from 'rev-models/lib/operations/operationresult';

describe('DetailView', () => {

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

        it('throws error when not nested inside a ModelProvider', () => {
            expect(() => {
                mount(<DetailView model="Post" />);
            }).to.throw('must be nested inside a ModelProvider');
        });

        it('throws error when specified model does not exist', () => {
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                    <DetailView model="NonExistey" />
                </ModelProvider>);
            }).to.throw(`Model 'NonExistey' is not registered`);
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

    describe('initial detailViewContext - when model does not have a primaryKey field', () => {
        let modelManager: rev.ModelManager;

        class ModelNoPK {
            @rev.TextField()
                name: string;
        }

        before(() => {
            resetTestView();
            modelManager = models.getModelManager();
            modelManager.register(ModelNoPK);
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="ModelNoPK">
                        <TestView />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('passes detailViewContext to contained Views', () => {
            expect(receivedDetailViewContext).not.to.be.null;
        });

        it('does not trigger a data load', () => {
            expect(receivedDetailViewContext.loadState).to.equal('NONE');
        });

        it('contains the current ModelManager', () => {
            expect(receivedDetailViewContext.manager).to.equal(modelManager);
        });

        it('a new model instance is created', () => {
            expect(receivedDetailViewContext.model).not.to.be.null;
            expect(receivedDetailViewContext.model).to.be.instanceof(ModelNoPK);
        });

        it('modelMeta is set', () => {
            expect(receivedDetailViewContext.modelMeta).to.deep.equal(modelManager.getModelMeta('ModelNoPK'));
        });

        it('validation information is null', () => {
            expect(receivedDetailViewContext.validation).to.be.null;
        });

        it('dirty is false', () => {
            expect(receivedDetailViewContext.dirty).to.be.false;
        });

    });

    describe('initial detailViewContext - when primaryKeyValue is not specified', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetTestView();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <TestView />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('passes detailViewContext to contained Views', () => {
            expect(receivedDetailViewContext).not.to.be.null;
        });

        it('does not trigger a data load', () => {
            expect(receivedDetailViewContext.loadState).to.equal('NONE');
        });

        it('contains the current ModelManager', () => {
            expect(receivedDetailViewContext.manager).to.equal(modelManager);
        });

        it('a new model instance is created', () => {
            expect(receivedDetailViewContext.model).not.to.be.null;
            expect(receivedDetailViewContext.model).to.be.instanceof(models.Post);
            expect(modelManager.isNew(receivedDetailViewContext.model!)).to.be.true;
        });

        it('modelMeta is set', () => {
            expect(receivedDetailViewContext.modelMeta).to.deep.equal(modelManager.getModelMeta('Post'));
        });

        it('validation information is null', () => {
            expect(receivedDetailViewContext.validation).to.be.null;
        });

        it('dirty is false', () => {
            expect(receivedDetailViewContext.dirty).to.be.false;
        });

    });

    describe('initial detailViewContext - when primaryKeyValue is specified', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetTestView();
            modelManager = models.getModelManager();
            const backend = modelManager.getBackend('default') as rev.InMemoryBackend;
            backend.OPERATION_DELAY = 10;
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post" primaryKeyValue="1">
                        <TestView />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('passes detailViewContext to contained Views', () => {
            expect(receivedDetailViewContext).not.to.be.null;
        });

        it('loadState is LOADING', () => {
            expect(receivedDetailViewContext.loadState).to.equal('LOADING');
        });

        it('contains the current ModelManager', () => {
            expect(receivedDetailViewContext.manager).to.equal(modelManager);
        });

        it('model data is initially null', () => {
            expect(receivedDetailViewContext.model).to.be.null;
        });

        it('modelMeta is set', () => {
            expect(receivedDetailViewContext.modelMeta).to.deep.equal(modelManager.getModelMeta('Post'));
        });

        it('validation information is null', () => {
            expect(receivedDetailViewContext.validation).to.be.null;
        });

        it('dirty is false', () => {
            expect(receivedDetailViewContext.dirty).to.be.false;
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
                    <DetailView model="Post" primaryKeyValue="1">
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

        it('model data is the requested model instance', () => {
            const ctx = receivedDetailViewContext;
            expect(ctx.model).to.be.instanceof(models.Post);
            expect(ctx.model!.id).to.equal(expectedData.posts[0].id);
            expect(ctx.model!.title).to.equal(expectedData.posts[0].title);
        });

        it('modelMeta is set', () => {
            expect(receivedDetailViewContext.modelMeta).to.deep.equal(modelManager.getModelMeta('Post'));
        });

        it('validation information is null', () => {
            expect(receivedDetailViewContext.validation).to.be.null;
        });

        it('dirty is false', () => {
            expect(receivedDetailViewContext.dirty).to.be.false;
        });

    });

    describe('setLoadState()', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetTestView();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <TestView />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('setLoadState() is passed in detailViewContext', () => {
            expect(receivedDetailViewContext.setLoadState).to.be.a('function');
        });

        it('detailViewContext.loadState is "NONE" by default', () => {
            expect(receivedDetailViewContext.loadState).to.equal('NONE');
        });

        it('initial render has completed', () => {
            expect(renderCount).to.equal(1);
        });

        it('setLoadState() changes the loadState and forces a re-render', () => {
            receivedDetailViewContext.setLoadState('SAVING');
            expect(receivedDetailViewContext.loadState).to.equal('SAVING');
            expect(renderCount).to.equal(2);
        });

        it('setLoadState() does not force a re-render if loadState value has not changed', () => {
            receivedDetailViewContext.setLoadState('SAVING');
            expect(renderCount).to.equal(2);
        });

    });

    describe('setDirty()', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetTestView();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <TestView />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('setDirty() is passed in detailViewContext', () => {
            expect(receivedDetailViewContext.setDirty).to.be.a('function');
        });

        it('detailViewContext.dirty is false by default', () => {
            expect(receivedDetailViewContext.dirty).to.be.false;
        });

        it('initial render has completed', () => {
            expect(renderCount).to.equal(1);
        });

        it('setDirty() changes the value of dirty and forces a re-render', () => {
            receivedDetailViewContext.setDirty(true);
            expect(receivedDetailViewContext.dirty).to.equal(true);
            expect(renderCount).to.equal(2);
        });

        it('setDirty() does not force a re-render if dirty value has not changed', () => {
            receivedDetailViewContext.setDirty(true);
            expect(renderCount).to.equal(2);
        });

    });

    describe('validate()', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetTestView();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <TestView />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('validate() is passed in detailViewContext', () => {
            expect(receivedDetailViewContext.validate).to.be.a('function');
        });

        it('detailViewContext.validation is null by default', () => {
            expect(receivedDetailViewContext.validation).to.be.null;
        });

        it('initial render has completed', () => {
            expect(renderCount).to.equal(1);
        });

        it('validate() triggers validation of the model, re-renders, and returns result', async () => {
            let result = await receivedDetailViewContext.validate();
            expect(result).to.be.instanceof(ModelValidationResult);
            expect(receivedDetailViewContext.validation).to.equal(result);
            expect(renderCount).to.equal(2);
        });

    });

    describe('save()', () => {
        let modelManager: rev.ModelManager;

        beforeEach(() => {
            resetTestView();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <TestView />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('save() is passed in detailViewContext', () => {
            expect(receivedDetailViewContext.save).to.be.a('function');
        });

        it('detailViewContext.validation is null by default', () => {
            expect(receivedDetailViewContext.validation).to.be.null;
        });

        it('initial render has completed', () => {
            expect(renderCount).to.equal(1);
        });

        describe('when model has no primary key', () => {

            beforeEach(() => {
                const meta = modelManager.getModelMeta(models.Post);
                meta.primaryKey = undefined;
            });

            it('save() throws an error and does not rerender', async () => {
                try {
                    await receivedDetailViewContext.save();
                    throw new Error('should have thrown');
                }
                catch (e) {
                    expect(e).to.be.instanceof(Error);
                    expect(e.message).to.equal(`DetailView Error: Cannot save data for model 'Post' because it doesn't have a primaryKey field defined.`);
                }

                expect(renderCount).to.equal(1);
            });

        });

        describe('when model is not valid', () => {

            it('save() triggers validation of the model, re-renders, and throws an error', async () => {
                try {
                    await receivedDetailViewContext.save();
                    throw new Error('should have thrown');
                }
                catch (e) {
                    expect(e).to.be.instanceof(rev.ValidationError);
                    expect(e.result).to.be.instanceof(ModelOperationResult);
                    const validation = e.result.validation;
                    expect(receivedDetailViewContext.validation).to.equal(validation);
                    expect(renderCount).to.equal(2);
                }
            });

        });

        describe('when model is valid, and is a new record', () => {

            it('save() triggers creation of the model, re-renders, and returns operation result', async () => {
                receivedDetailViewContext.model = new models.Post({
                    title: 'Valid New Post', body: 'Posty Posty...'
                });
                const result = await receivedDetailViewContext.save();
                expect(result).to.be.instanceof(ModelOperationResult);
                expect(result.operation.operationName).to.equal('create');
                expect(result.success).to.be.true;
                expect(result.result).not.to.be.undefined;
                expect(result.result).to.be.instanceof(models.Post);
                expect(result.result!.id).to.be.a('number');
                expect(receivedDetailViewContext.model.id).to.be.a('number');
                expect(receivedDetailViewContext.validation).to.equal(result.validation);
                expect(renderCount).to.equal(2);
            });

        });

        describe('when model is valid, and is an updated record', () => {

            it('save() triggers update of the model, re-renders, and returns operation result', async () => {
                receivedDetailViewContext.model = new models.Post({
                    id: 100, title: 'Valid New Post', body: 'Posty Posty...'
                });
                const result = await receivedDetailViewContext.save();
                expect(result).to.be.instanceof(ModelOperationResult);
                expect(result.operation.operationName).to.equal('update');
                expect(result.operation.where).to.deep.equal({ id: 100 });
                expect(result.success).to.be.true;
                expect(receivedDetailViewContext.validation).to.equal(result.validation);
                expect(renderCount).to.equal(2);
            });

        });

    });

    describe('remove()', () => {
        let modelManager: rev.ModelManager;

        beforeEach(() => {
            resetTestView();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <TestView />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('remove() is passed in detailViewContext', () => {
            expect(receivedDetailViewContext.save).to.be.a('function');
        });

        it('initial render has completed', () => {
            expect(renderCount).to.equal(1);
        });

        describe('when model has no primary key', () => {

            beforeEach(() => {
                const meta = modelManager.getModelMeta(models.Post);
                meta.primaryKey = undefined;
            });

            it('remove() throws an error and does not rerender', async () => {
                try {
                    await receivedDetailViewContext.remove();
                    throw new Error('should have thrown');
                }
                catch (e) {
                    expect(e).to.be.instanceof(Error);
                    expect(e.message).to.equal(`DetailView Error: Cannot remove record for model 'Post' because it doesn't have a primaryKey field defined.`);
                }

                expect(renderCount).to.equal(1);
            });

        });

        describe('when model is a new record', () => {

            it('remove() throws an error', async () => {
                receivedDetailViewContext.model = new models.Post({
                    title: 'Valid New Post', body: 'Posty Posty...'
                });
                try {
                    await receivedDetailViewContext.remove();
                    throw new Error('should have thrown');
                }
                catch (e) {
                    expect(e).to.be.instanceof(Error);
                    expect(e.message).to.equal('Cannot call remove() on a new model record.');
                }
            });

        });

        describe('when model is an existing record', () => {

            it('remove() triggers removal of the model, re-renders, and returns operation result', async () => {
                receivedDetailViewContext.model = new models.Post({
                    id: 100, title: 'Valid New Post', body: 'Posty Posty...'
                });
                const result = await receivedDetailViewContext.remove();

                expect(result).to.be.instanceof(ModelOperationResult);
                expect(result.operation.operationName).to.equal('remove');
                expect(result.operation.where).to.deep.equal({ id: 100 });
                expect(result.success).to.be.true;

                expect(renderCount).to.equal(2);
                expect(receivedDetailViewContext.model).to.deep.equal(new models.Post());
                expect(receivedDetailViewContext.validation).to.equal(null);
                expect(receivedDetailViewContext.dirty).to.equal(false);

            });

        });

    });

    describe('refresh()', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetTestView();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <TestView />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('refresh() is passed in detailViewContext', () => {
            expect(receivedDetailViewContext.refresh).to.be.a('function');
        });

        it('initial render has completed', () => {
            expect(renderCount).to.equal(1);
        });

        it('calling refresh() forces a re-render', () => {
            receivedDetailViewContext.refresh();
            expect(renderCount).to.equal(2);
        });

    });

    describe('rendering', () => {
        let modelManager: rev.ModelManager;
        let wrapper: ReactWrapper;

        before(() => {
            modelManager = models.getModelManager();
            wrapper = mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <span>content</span>
                    </DetailView>
                </ModelProvider>
            );
        });

        it('renders children directly', () => {
            expect(wrapper.at(0).text()).to.equal('content');
        });

    });

    describe('Standard Component Properties', () => {
        let modelManager: rev.ModelManager;
        let receivedProps: IDetailViewProps;

        const SpyComponent = (props: any) => {
            receivedProps = props;
            return <p>SpyComponent</p>;
        };

        before(() => {
            receivedProps = null as any;
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView
                        model="Post"
                        component={SpyComponent}
                        style={{marginTop: 10}}
                    />
                </ModelProvider>
            );
        });

        it('style prop is passed to rendered component', () => {
            expect(receivedProps.style).to.deep.equal({marginTop: 10});
        });

    });

    /**
     * TODO
     *  - test when a slow load completes during a save
     *     OR make sure you cant save during a load
     */
});