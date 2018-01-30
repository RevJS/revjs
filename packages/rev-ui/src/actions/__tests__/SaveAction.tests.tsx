
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

        it('sets loadState = "SAVING" when the action is triggered', () => {
            expect(receivedProps.modelContext.loadState).to.equal('NONE');
            receivedProps.doAction().catch((e) => null);
            expect(receivedProps.modelContext.loadState).to.equal('SAVING');
        });

        it('resets loadState and calls onError() if an error is returned from save()', async () => {
            expect(receivedProps.modelContext.loadState).to.equal('NONE');

            const expectedError = new Error('ack!!!');
            receivedProps.modelContext.save = () => Promise.reject(expectedError);

            await receivedProps.doAction();

            expect(onErrorCallback.callCount).to.equal(1);
            const err = onErrorCallback.getCall(0).args[0];
            expect(err).to.equal(expectedError);

            expect(receivedProps.modelContext.loadState).to.equal('NONE');
        });

        it('resets loadState and calls onSuccess() if the save() method is successful', async () => {
            expect(receivedProps.modelContext.loadState).to.equal('NONE');

            const expectedResult = 'Yay!';
            receivedProps.modelContext.save = () => Promise.resolve(expectedResult) as any;

            await receivedProps.doAction();

            expect(onSuccessCallback.callCount).to.equal(1);
            const result = onSuccessCallback.getCall(0).args[0];
            expect(result).to.equal(expectedResult);

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
            receivedProps.modelContext.refresh();
            expect(receivedProps.disabled).to.be.true;
        });

    });

});