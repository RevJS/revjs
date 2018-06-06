
import * as React from 'react';
import * as sinon from 'sinon';
import * as models from '../../__fixtures__/models';
import { createData } from '../../__fixtures__/modeldata';
import { sleep } from '../../__test_utils__/utils';
import { expect } from 'chai';
import * as rev from 'rev-models';
import { mount, ReactWrapper } from 'enzyme';
import { ModelProvider } from '../../provider/ModelProvider';
import { DetailView, IDetailViewContextProp } from '../../views/DetailView';
import { RemoveAction, IRemoveActionProps } from '../RemoveAction';
import { withDetailViewContext } from '../../views/withDetailViewContext';
import { IActionComponentProps } from '../types';

describe('RemoveAction', () => {

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
                mount(<RemoveAction label="Remove" />);
            }).to.throw('must be nested inside a DetailView');
        });

    });

    type SpyComponentProps = IActionComponentProps & IDetailViewContextProp;
    let receivedProps: SpyComponentProps;

    const SpyComponent = withDetailViewContext<IActionComponentProps>((props) => {
        receivedProps = props;
        return props.children as any || <p>SpyComponent</p>;
    });

    function resetSpyComponent() {
        receivedProps = null as any;
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
                        <RemoveAction
                            label="Remove"
                            component={SpyComponent}
                        >
                            Delete the thing
                        </RemoveAction>
                    </DetailView>
                </ModelProvider>
            );
        });

        it('renders any content passed as a child', () => {
            expect(wrapper.text()).to.equal('Delete the thing');
        });

    });

    describe('IActionComponentProps - default label', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <RemoveAction
                            component={SpyComponent}
                        />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('default label = "Delete"', () => {
            expect(receivedProps.label).to.equal('Delete');
        });

    });

    describe('IActionComponentProps - new model loaded', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <RemoveAction
                            label="Remove"
                            component={SpyComponent}
                        />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('passes through label', () => {
            expect(receivedProps.label).to.equal('Remove');
        });

        it('disabled = true for New Models', () => {
            expect(receivedProps.disabled).to.be.true;
        });

        it('defaultAction = false', () => {
            expect(receivedProps.defaultAction).to.be.false;
        });

        it('passes through doAction() function', () => {
            expect(receivedProps.doAction).to.be.a('function');
        });

    });

    describe('IActionComponentProps - defaultAction', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <RemoveAction
                            label="Remove"
                            defaultAction={true}
                            component={SpyComponent}
                        />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('defaultAction = true', () => {
            expect(receivedProps.defaultAction).to.be.true;
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
                        <RemoveAction
                            label="Remove"
                            component={SpyComponent}
                        />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('passes through label', () => {
            expect(receivedProps.label).to.equal('Remove');
        });

        it('disabled = true', () => {
            expect(receivedProps.disabled).to.be.true;
        });

        it('passes through doAction() function', () => {
            expect(receivedProps.doAction).to.be.a('function');
        });

    });

    describe('IActionComponentProps - existing model loaded', () => {
        let modelManager: rev.ModelManager;

        before(async () => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            await createData(modelManager);
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post" primaryKeyValue="1">
                        <RemoveAction
                            label="Remove"
                            component={SpyComponent}
                        />
                    </DetailView>
                </ModelProvider>
            );
            await sleep(10);
        });

        it('passes through label', () => {
            expect(receivedProps.label).to.equal('Remove');
        });

        it('disabled = false for Existing Models', () => {
            expect(receivedProps.disabled).to.be.false;
        });

        it('passes through doAction() function', () => {
            expect(receivedProps.doAction).to.be.a('function');
        });

    });

    describe('doAction()', () => {
        let modelManager: rev.ModelManager;
        let onSuccessCallback: sinon.SinonSpy;
        let onErrorCallback: sinon.SinonSpy;
        let props: IRemoveActionProps;

        function render() {
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="User">
                        <RemoveAction {...props} />
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
                label: 'Remove',
                onSuccess: onSuccessCallback,
                onError: onErrorCallback,
                component: SpyComponent
            };
            render();
        });

        it('sets loadState = "SAVING" when the action is triggered', () => {
            expect(receivedProps.detailViewContext.loadState).to.equal('NONE');
            receivedProps.doAction().catch((e) => null);
            expect(receivedProps.detailViewContext.loadState).to.equal('SAVING');
        });

        it('resets loadState and calls onError() if an error is returned from remove()', async () => {
            expect(receivedProps.detailViewContext.loadState).to.equal('NONE');

            const expectedError = new Error('ack!!!');
            receivedProps.detailViewContext.remove = () => Promise.reject(expectedError);

            await receivedProps.doAction();

            expect(onErrorCallback.callCount).to.equal(1);
            const err = onErrorCallback.getCall(0).args[0];
            expect(err).to.equal(expectedError);

            expect(receivedProps.detailViewContext.loadState).to.equal('NONE');
        });

        it('resets loadState and calls onSuccess() if the remove() method is successful', async () => {
            expect(receivedProps.detailViewContext.loadState).to.equal('NONE');

            const expectedResult = 'Yay!';
            receivedProps.detailViewContext.remove = () => Promise.resolve(expectedResult) as any;

            await receivedProps.doAction();

            expect(onSuccessCallback.callCount).to.equal(1);
            const result = onSuccessCallback.getCall(0).args[0];
            expect(result).to.equal(expectedResult);

            expect(receivedProps.detailViewContext.loadState).to.equal('NONE');
        });

    });

    describe('disabled property', () => {
        let modelManager: rev.ModelManager;

        before(async () => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            await createData(modelManager);
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="User" primaryKeyValue="1">
                        <RemoveAction
                            label="Remove"

                            disabled={(ctx) => {
                                return ctx.model!.name == 'should be disabled';
                            }}

                            component={SpyComponent}
                        />
                    </DetailView>
                </ModelProvider>
            );
            await sleep(10);
        });

        it('control not disabled when disabled function returns false', () => {
            expect(receivedProps.disabled).to.be.false;
        });

        it('control disabled when disabled function returns true', () => {
            receivedProps.detailViewContext.model!.name = 'should be disabled';
            receivedProps.detailViewContext.refresh();
            expect(receivedProps.disabled).to.be.true;
        });

    });

    describe('Standard Props', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <RemoveAction
                            label="Remove"
                            component={SpyComponent}
                            style={{marginTop: 10}}
                        />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('style prop is passed to rendered component', () => {
            expect(receivedProps.style).to.deep.equal({marginTop: 10});
        });

    });

});