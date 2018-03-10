
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as sinon from 'sinon';
import * as models from '../../__fixtures__/models';
import { createData, IModelTestData } from '../../__fixtures__/modeldata';
import { expect } from 'chai';
import * as rev from 'rev-models';
import { mount, ReactWrapper } from 'enzyme';
import { ModelProvider } from '../../provider/ModelProvider';
import { DetailView, IModelContext } from '../DetailView';
import { sleep } from '../../__test_utils__/utils';
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

    let receivedModelContext: IModelContext;
    let renderCount: number;

    class TestView extends React.Component {
        static contextTypes = {
            modelManager: PropTypes.object,
            modelContext: PropTypes.object
        };
        constructor(props: any, context: any) {
            super(props, context);
            receivedModelContext = this.context.modelContext;
        }
        render() {
            renderCount++;
            return <p>SpyComponent</p>;
        }
    }

    function resetTestView() {
        receivedModelContext = null;
        renderCount = 0;
    }

    describe('initial modelContext - when model does not have a primaryKey field', () => {
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

        it('passes modelContext to contained Views', () => {
            expect(receivedModelContext).not.to.be.null;
        });

        it('does not trigger a data load', () => {
            expect(receivedModelContext.loadState).to.equal('NONE');
        });

        it('contains the current ModelManager', () => {
            expect(receivedModelContext.manager).to.equal(modelManager);
        });

        it('a new model instance is created', () => {
            expect(receivedModelContext.model).not.to.be.null;
            expect(receivedModelContext.model).to.be.instanceof(ModelNoPK);
        });

        it('modelMeta is set', () => {
            expect(receivedModelContext.modelMeta).to.deep.equal(modelManager.getModelMeta('ModelNoPK'));
        });

        it('validation information is null', () => {
            expect(receivedModelContext.validation).to.be.null;
        });

        it('dirty is false', () => {
            expect(receivedModelContext.dirty).to.be.false;
        });

    });

    describe('initial modelContext - when primaryKeyValue is not specified', () => {
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

        it('passes modelContext to contained Views', () => {
            expect(receivedModelContext).not.to.be.null;
        });

        it('does not trigger a data load', () => {
            expect(receivedModelContext.loadState).to.equal('NONE');
        });

        it('contains the current ModelManager', () => {
            expect(receivedModelContext.manager).to.equal(modelManager);
        });

        it('a new model instance is created', () => {
            expect(receivedModelContext.model).not.to.be.null;
            expect(receivedModelContext.model).to.be.instanceof(models.Post);
            expect(modelManager.isNew(receivedModelContext.model)).to.be.true;
        });

        it('modelMeta is set', () => {
            expect(receivedModelContext.modelMeta).to.deep.equal(modelManager.getModelMeta('Post'));
        });

        it('validation information is null', () => {
            expect(receivedModelContext.validation).to.be.null;
        });

        it('dirty is false', () => {
            expect(receivedModelContext.dirty).to.be.false;
        });

    });

    describe('initial modelContext - when primaryKeyValue is specified', () => {
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

        it('passes modelContext to contained Views', () => {
            expect(receivedModelContext).not.to.be.null;
        });

        it('loadState is LOADING', () => {
            expect(receivedModelContext.loadState).to.equal('LOADING');
        });

        it('contains the current ModelManager', () => {
            expect(receivedModelContext.manager).to.equal(modelManager);
        });

        it('model data is initially null', () => {
            expect(receivedModelContext.model).to.be.null;
        });

        it('modelMeta is set', () => {
            expect(receivedModelContext.modelMeta).to.deep.equal(modelManager.getModelMeta('Post'));
        });

        it('validation information is null', () => {
            expect(receivedModelContext.validation).to.be.null;
        });

        it('dirty is false', () => {
            expect(receivedModelContext.dirty).to.be.false;
        });

    });

    describe('modelContext after successful model load', () => {
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
            expect(receivedModelContext.loadState).to.equal('NONE');
        });

        it('model data is the requested model instance', () => {
            const ctx = receivedModelContext;
            expect(ctx.model).to.be.instanceof(models.Post);
            expect(ctx.model.id).to.equal(expectedData.posts[0].id);
            expect(ctx.model.title).to.equal(expectedData.posts[0].title);
        });

        it('modelMeta is set', () => {
            expect(receivedModelContext.modelMeta).to.deep.equal(modelManager.getModelMeta('Post'));
        });

        it('validation information is null', () => {
            expect(receivedModelContext.validation).to.be.null;
        });

        it('dirty is false', () => {
            expect(receivedModelContext.dirty).to.be.false;
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

        it('setLoadState() is passed in modelContext', () => {
            expect(receivedModelContext.setLoadState).to.be.a('function');
        });

        it('modelContext.loadState is "NONE" by default', () => {
            expect(receivedModelContext.loadState).to.equal('NONE');
        });

        it('initial render has completed', () => {
            expect(renderCount).to.equal(1);
        });

        it('setLoadState() changes the loadState and forces a re-render', () => {
            receivedModelContext.setLoadState('SAVING');
            expect(receivedModelContext.loadState).to.equal('SAVING');
            expect(renderCount).to.equal(2);
        });

        it('setLoadState() does not force a re-render if loadState value has not changed', () => {
            receivedModelContext.setLoadState('SAVING');
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

        it('setDirty() is passed in modelContext', () => {
            expect(receivedModelContext.setDirty).to.be.a('function');
        });

        it('modelContext.dirty is false by default', () => {
            expect(receivedModelContext.dirty).to.be.false;
        });

        it('initial render has completed', () => {
            expect(renderCount).to.equal(1);
        });

        it('setDirty() changes the value of dirty and forces a re-render', () => {
            receivedModelContext.setDirty(true);
            expect(receivedModelContext.dirty).to.equal(true);
            expect(renderCount).to.equal(2);
        });

        it('setDirty() does not force a re-render if dirty value has not changed', () => {
            receivedModelContext.setDirty(true);
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

        it('validate() is passed in modelContext', () => {
            expect(receivedModelContext.validate).to.be.a('function');
        });

        it('modelContext.validation is null by default', () => {
            expect(receivedModelContext.validation).to.be.null;
        });

        it('initial render has completed', () => {
            expect(renderCount).to.equal(1);
        });

        it('validate() triggers validation of the model, re-renders, and returns result', async () => {
            let result = await receivedModelContext.validate();
            expect(result).to.be.instanceof(ModelValidationResult);
            expect(receivedModelContext.validation).to.equal(result);
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

        it('save() is passed in modelContext', () => {
            expect(receivedModelContext.save).to.be.a('function');
        });

        it('modelContext.validation is null by default', () => {
            expect(receivedModelContext.validation).to.be.null;
        });

        it('initial render has completed', () => {
            expect(renderCount).to.equal(1);
        });

        describe('when model has no primary key', () => {

            beforeEach(() => {
                const meta = modelManager.getModelMeta(models.Post);
                meta.primaryKey = null;
            });

            it('save() throws an error and does not rerender', async () => {
                try {
                    await receivedModelContext.save();
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
                    await receivedModelContext.save();
                    throw new Error('should have thrown');
                }
                catch (e) {
                    expect(e).to.be.instanceof(rev.ValidationError);
                    expect(e.result).to.be.instanceof(ModelOperationResult);
                    const validation = e.result.validation;
                    expect(receivedModelContext.validation).to.equal(validation);
                    expect(renderCount).to.equal(2);
                }
            });

        });

        describe('when model is valid, and is a new record', () => {

            it('save() triggers creation of the model, re-renders, and returns operation result', async () => {
                receivedModelContext.model = new models.Post({
                    title: 'Valid New Post', body: 'Posty Posty...'
                });
                const result = await receivedModelContext.save();
                expect(result).to.be.instanceof(ModelOperationResult);
                expect(result.operation.operationName).to.equal('create');
                expect(result.success).to.be.true;
                expect(result.result).not.to.be.undefined;
                expect(result.result).to.be.instanceof(models.Post);
                expect(result.result.id).not.to.be.null;
                expect(receivedModelContext.validation).to.equal(result.validation);
                expect(renderCount).to.equal(2);
            });

        });

        describe('when model is valid, and is an updated record', () => {

            it('save() triggers update of the model, re-renders, and returns operation result', async () => {
                receivedModelContext.model = new models.Post({
                    id: 100, title: 'Valid New Post', body: 'Posty Posty...'
                });
                const result = await receivedModelContext.save();
                expect(result).to.be.instanceof(ModelOperationResult);
                expect(result.operation.operationName).to.equal('update');
                expect(result.operation.where).to.deep.equal({ id: 100 });
                expect(result.success).to.be.true;
                expect(receivedModelContext.validation).to.equal(result.validation);
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

        it('remove() is passed in modelContext', () => {
            expect(receivedModelContext.save).to.be.a('function');
        });

        it('initial render has completed', () => {
            expect(renderCount).to.equal(1);
        });

        describe('when model has no primary key', () => {

            beforeEach(() => {
                const meta = modelManager.getModelMeta(models.Post);
                meta.primaryKey = null;
            });

            it('remove() throws an error and does not rerender', async () => {
                try {
                    await receivedModelContext.remove();
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
                receivedModelContext.model = new models.Post({
                    title: 'Valid New Post', body: 'Posty Posty...'
                });
                try {
                    await receivedModelContext.remove();
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
                receivedModelContext.model = new models.Post({
                    id: 100, title: 'Valid New Post', body: 'Posty Posty...'
                });
                const result = await receivedModelContext.remove();

                expect(result).to.be.instanceof(ModelOperationResult);
                expect(result.operation.operationName).to.equal('remove');
                expect(result.operation.where).to.deep.equal({ id: 100 });
                expect(result.success).to.be.true;

                expect(renderCount).to.equal(2);
                expect(receivedModelContext.model).to.deep.equal(new models.Post());
                expect(receivedModelContext.validation).to.equal(null);
                expect(receivedModelContext.dirty).to.equal(false);

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

        it('refresh() is passed in modelContext', () => {
            expect(receivedModelContext.refresh).to.be.a('function');
        });

        it('initial render has completed', () => {
            expect(renderCount).to.equal(1);
        });

        it('calling refresh() forces a re-render', () => {
            receivedModelContext.refresh();
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

    /**
     * TODO
     *  - test when a slow load completes during a save
     *     OR make sure you cant save during a load
     */
});