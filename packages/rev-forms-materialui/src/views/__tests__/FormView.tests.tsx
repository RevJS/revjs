
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as sinon from 'sinon';
import * as models from '../../__fixtures__/models';
import { createData, IModelTestData } from '../../__fixtures__/modeldata';
import { expect } from 'chai';
import * as rev from 'rev-models';
import { mount, ReactWrapper } from 'enzyme';
import { ModelProvider } from '../../provider/ModelProvider';
import { FormView, IModelContext } from '../FormView';
import { sleep } from '../../__test_utils__/utils';
import { ModelValidationResult } from 'rev-models/lib/validation/validationresult';

describe('FormView', () => {

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
                mount(<FormView model="Post" />);
            }).to.throw('must be nested inside a ModelProvider');
        });

        it('throws error when specified model does not exist', () => {
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                    <FormView model="NonExistey" />
                </ModelProvider>);
            }).to.throw(`Model 'NonExistey' is not registered`);
        });

        it('throws error when specified model does not define a primaryKey', () => {
            class ModelNoPK {
                @rev.TextField()
                    name: string;
            }
            modelManager.register(ModelNoPK);
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                    <FormView model="ModelNoPK" />
                </ModelProvider>);
            }).to.throw(`can only be used with models that have a primaryKey`);
        });

    });

    let receivedViewContext: IModelContext;
    let renderCount: number;

    class TestView extends React.Component {
        static contextTypes = {
            modelManager: PropTypes.object,
            modelContext: PropTypes.object
        };
        constructor(props: any, context: any) {
            super(props, context);
            receivedViewContext = this.context.modelContext;
        }
        render() {
            renderCount++;
            return <p>SpyComponent</p>;
        }
    }

    function resetTestView() {
        receivedViewContext = null;
        renderCount = 0;
    }

    describe('initial modelContext - when primaryKeyValue is not specified', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetTestView();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <FormView model="Post">
                        <TestView />
                    </FormView>
                </ModelProvider>
            );
        });

        it('passes modelContext to contained Views', () => {
            expect(receivedViewContext).not.to.be.null;
        });

        it('does not trigger a data load', () => {
            expect(receivedViewContext.loadState).to.equal('NONE');
        });

        it('contains the current ModelManager', () => {
            expect(receivedViewContext.manager).to.equal(modelManager);
        });

        it('a new model instance is created', () => {
            expect(receivedViewContext.model).not.to.be.null;
            expect(receivedViewContext.model).to.be.instanceof(models.Post);
            expect(modelManager.isNew(receivedViewContext.model)).to.be.true;
        });

        it('modelMeta is set', () => {
            expect(receivedViewContext.modelMeta).to.deep.equal(modelManager.getModelMeta('Post'));
        });

        it('validation information is null', () => {
            expect(receivedViewContext.validation).to.be.null;
        });

        it('dirty is false', () => {
            expect(receivedViewContext.dirty).to.be.false;
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
                    <FormView model="Post" primaryKeyValue="1">
                        <TestView />
                    </FormView>
                </ModelProvider>
            );
        });

        it('passes modelContext to contained Views', () => {
            expect(receivedViewContext).not.to.be.null;
        });

        it('loadState is LOADING', () => {
            expect(receivedViewContext.loadState).to.equal('LOADING');
        });

        it('contains the current ModelManager', () => {
            expect(receivedViewContext.manager).to.equal(modelManager);
        });

        it('model data is initially null', () => {
            expect(receivedViewContext.model).to.be.null;
        });

        it('modelMeta is set', () => {
            expect(receivedViewContext.modelMeta).to.deep.equal(modelManager.getModelMeta('Post'));
        });

        it('validation information is null', () => {
            expect(receivedViewContext.validation).to.be.null;
        });

        it('dirty is false', () => {
            expect(receivedViewContext.dirty).to.be.false;
        });

    });

    describe('modelContext after successful model load', () => {
        let modelManager: rev.ModelManager;
        let expectedData: IModelTestData;

        before(async () => {
            resetTestView();
            modelManager = models.getModelManager();
            expectedData = await createData(modelManager);
            const wrapper = mount(
                <ModelProvider modelManager={modelManager}>
                    <FormView model="Post" primaryKeyValue="1">
                        <TestView />
                    </FormView>
                </ModelProvider>
            );
            await sleep(10);
            wrapper.update();
        });

        it('loadState is set back to NONE', () => {
            expect(receivedViewContext.loadState).to.equal('NONE');
        });

        it('model data is the requested model instance', () => {
            const ctx = receivedViewContext;
            expect(ctx.model).to.be.instanceof(models.Post);
            expect(ctx.model.id).to.equal(expectedData.posts[0].id);
            expect(ctx.model.title).to.equal(expectedData.posts[0].title);
        });

        it('modelMeta is set', () => {
            expect(receivedViewContext.modelMeta).to.deep.equal(modelManager.getModelMeta('Post'));
        });

        it('validation information is null', () => {
            expect(receivedViewContext.validation).to.be.null;
        });

        it('dirty is false', () => {
            expect(receivedViewContext.dirty).to.be.false;
        });

    });

    describe('setDirty()', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetTestView();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <FormView model="Post">
                        <TestView />
                    </FormView>
                </ModelProvider>
            );
        });

        it('setDirty() is passed in modelContext', () => {
            expect(receivedViewContext.setDirty).to.be.a('function');
        });

        it('modelContext.dirty is false by default', () => {
            expect(receivedViewContext.dirty).to.be.false;
        });

        it('initial render has completed', () => {
            expect(renderCount).to.equal(1);
        });

        it('setDirty() changes the value of dirty and forces a re-render', () => {
            receivedViewContext.setDirty(true);
            expect(receivedViewContext.dirty).to.equal(true);
            expect(renderCount).to.equal(2);
        });

        it('setDirty() does not force a re-render if dirty value has not changed', () => {
            receivedViewContext.setDirty(true);
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
                    <FormView model="Post">
                        <TestView />
                    </FormView>
                </ModelProvider>
            );
        });

        it('validate() is passed in modelContext', () => {
            expect(receivedViewContext.setDirty).to.be.a('function');
        });

        it('modelContext.validation is null by default', () => {
            expect(receivedViewContext.validation).to.be.null;
        });

        it('initial render has completed', () => {
            expect(renderCount).to.equal(1);
        });

        it('validate() triggers validation of the model, re-renders, and returns result', async () => {
            let result = await receivedViewContext.validate();
            expect(result).to.be.instanceof(ModelValidationResult);
            expect(receivedViewContext.validation).to.equal(result);
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
                    <FormView model="Post">
                        <span>content</span>
                    </FormView>
                </ModelProvider>
            );
        });

        it('renders a form tag', () => {
            expect(wrapper.find('form')).to.have.length(1);
        });

        it('the form tag wraps the specified children', () => {
            const form = wrapper.find('form').at(0);
            expect(form.childAt(0).text()).to.equal('content');
        });

    });

    /**
     * TODO
     *  - test when a slow load completes during a save
     *     OR make sure you cant save during a load
     */
});