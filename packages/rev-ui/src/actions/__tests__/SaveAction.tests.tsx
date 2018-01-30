
import * as React from 'react';
import * as sinon from 'sinon';
import * as models from '../../__fixtures__/models';
import { expect } from 'chai';
import * as rev from 'rev-models';
import { mount, ReactWrapper } from 'enzyme';
import { ModelProvider } from '../../provider/ModelProvider';
import { DetailView, IModelContextProp, IModelContext } from '../../views/DetailView';
import { SaveAction, ISaveActionProps } from '../SaveAction';
import { withModelContext } from '../../views/withModelContext';
import { ModelOperationResult } from 'rev-models/lib/operations/operationresult';
import { IActionComponentProps } from '../types';

describe('SaveAction', () => {

    describe('construction', () => {
        let errorStub: sinon.SinonStub;

        beforeEach(() => {
            errorStub = sinon.stub(console, 'error');
        });

        afterEach(() => {
            errorStub.restore();
        });

        it('throws error when not nested inside a DetailView', () => {
            expect(() => {
                mount(<SaveAction label="Save" />);
            }).to.throw('must be nested inside a DetailView');
        });

    });

    type SpyComponentProps = IActionComponentProps & IModelContextProp;
    let receivedProps: SpyComponentProps;

    const SpyComponent = withModelContext<IActionComponentProps>((props) => {
        receivedProps = props;
        return props.children as any || <p>SpyComponent</p>;
    });

    function resetSpyComponent() {
        receivedProps = null;
    }

    describe('rendering', () => {
        let modelManager: rev.ModelManager;
        let wrapper: ReactWrapper;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            wrapper = mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <SaveAction
                            label="Save"
                            component={SpyComponent}
                        >
                            Save Stuff
                        </SaveAction>
                    </DetailView>
                </ModelProvider>
            );
        });

        it('renders any content passed as a child', () => {
            expect(wrapper.text()).to.equal('Save Stuff');
        });

    });

    describe('IActionComponentProps - model loaded', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <SaveAction
                            label="Save"
                            component={SpyComponent}
                        />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('passes through label', () => {
            expect(receivedProps.label).to.equal('Save');
        });

        it('disabled = false', () => {
            expect(receivedProps.disabled).to.be.false;
        });

        it('passes through doAction() function', () => {
            expect(receivedProps.doAction).to.be.a('function');
        });

    });

    describe('IActionComponentProps - loading in progress', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            const backend = modelManager.getBackend('default') as rev.InMemoryBackend;
            backend.OPERATION_DELAY = 10;
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post" primaryKeyValue="1">
                        <SaveAction
                            label="Save"
                            component={SpyComponent}
                        />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('passes through label', () => {
            expect(receivedProps.label).to.equal('Save');
        });

        it('disabled = true', () => {
            expect(receivedProps.disabled).to.be.true;
        });

        it('passes through doAction() function', () => {
            expect(receivedProps.doAction).to.be.a('function');
        });

    });

    describe('doAction()', () => {
        let modelManager: rev.ModelManager;
        let onSuccessCallback: sinon.SinonSpy;
        let onErrorCallback: sinon.SinonSpy;
        let props: ISaveActionProps;

        function render() {
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="User">
                        <SaveAction {...props} />
                    </DetailView>
                </ModelProvider>
            );
        }

        beforeEach(() => {
            onSuccessCallback = sinon.spy();
            onErrorCallback = sinon.spy();

            resetSpyComponent();
            modelManager = models.getModelManager();
            props = {
                label: 'Save',
                onSuccess: onSuccessCallback,
                onError: onErrorCallback,
                component: SpyComponent
            };
            render();
        });

        function setupValidModel(options: { id: number }) {
            const user = new models.User({
                id: options.id, name: 'Bob'
            });
            receivedProps.modelContext.model = user;
            return user;
        }

        it('sets loadState = "SAVING" when the action is triggered', () => {
            expect(receivedProps.modelContext.loadState).to.equal('NONE');
            receivedProps.doAction().catch((e) => null);
            expect(receivedProps.modelContext.loadState).to.equal('SAVING');
        });

        it('resets loadState and calls onError() if there was an error (e.g. model is not valid)', async () => {
            expect(receivedProps.modelContext.loadState).to.equal('NONE');

            await receivedProps.doAction();

            expect(onErrorCallback.callCount).to.equal(1);
            const err = onErrorCallback.getCall(0).args[0];
            expect(err).to.be.instanceof(Error);
            expect(err.message).to.equal('ValidationError');
            expect(err.result).to.be.instanceof(ModelOperationResult);
            expect(err.result.validation.valid).to.be.false;
            expect(receivedProps.modelContext.loadState).to.equal('NONE');
        });

        it('when model is valid, and is a new record, it is created and onSuccess() is called', async () => {
            expect(receivedProps.modelContext.loadState).to.equal('NONE');
            setupValidModel({ id: null });

            await receivedProps.doAction();

            expect(onSuccessCallback.callCount).to.equal(1);
            const result: rev.IModelOperationResult<any, any> = onSuccessCallback.getCall(0).args[0];

            expect(result).to.be.instanceof(ModelOperationResult);
            expect(result.operation.operation).to.equal('create');
            expect(result.success).to.be.true;
            expect(result.result).not.to.be.undefined;
            expect(result.result).to.be.instanceof(models.User);
            expect(result.result.id).not.to.be.null;

            expect(receivedProps.modelContext.loadState).to.equal('NONE');
        });

        it('when model is valid, and is an existing record, it is updated and onSuccess() is called', async () => {
            expect(receivedProps.modelContext.loadState).to.equal('NONE');
            setupValidModel({ id: 100 });

            await receivedProps.doAction();

            expect(onSuccessCallback.callCount).to.equal(1);
            const result: rev.IModelOperationResult<any, any> = onSuccessCallback.getCall(0).args[0];

            expect(result).to.be.instanceof(ModelOperationResult);
            expect(result.operation.operation).to.equal('update');
            expect(result.operation.where).to.deep.equal({ id: 100 });
            expect(result.success).to.be.true;

            expect(receivedProps.modelContext.loadState).to.equal('NONE');
        });

    });

    describe('disabled property', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="User">
                        <SaveAction
                            label="Save"

                            disabled={(ctx: IModelContext<models.User>) => {
                                return ctx.model.name == 'should be disabled';
                            }}

                            component={SpyComponent}
                        />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('control not disabled when disabled function returns false', () => {
            expect(receivedProps.disabled).to.be.false;
        });

        it('control disabled when disabled function returns true', () => {
            receivedProps.modelContext.model.name = 'should be disabled';
            receivedProps.modelContext.update();
            expect(receivedProps.disabled).to.be.true;
        });

    });

});