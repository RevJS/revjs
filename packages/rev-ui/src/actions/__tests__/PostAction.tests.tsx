
import * as React from 'react';
import * as sinon from 'sinon';
import * as models from '../../__fixtures__/models';
import { expect } from 'chai';
import * as rev from 'rev-models';
import { mount, ReactWrapper } from 'enzyme';
import { ModelProvider } from '../../provider/ModelProvider';
import { DetailView, IDetailViewContextProp, IDetailViewContext } from '../../views/DetailView';
import { PostAction, IPostActionProps } from '../PostAction';
import { withDetailViewContext } from '../../views/withDetailViewContext';
import { ModelValidationResult } from 'rev-models/lib/validation/validationresult';
import { IActionComponentProps } from '../types';

describe('PostAction', () => {

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
                mount(<PostAction label="Submit" url="/api" />);
            }).to.throw('must be nested inside a DetailView');
        });

        it('throws error when the url property is not set', () => {
            const Comp: any = PostAction;
            const modelManager = models.getModelManager();
            expect(() => {
                mount(
                    <ModelProvider modelManager={modelManager}>
                        <DetailView model="User">
                            <Comp label="Submit" />
                        </DetailView>
                    </ModelProvider>);
            }).to.throw('you must specify the url property');
        });

    });

    type SpyComponentProps = IActionComponentProps & IDetailViewContextProp<models.User>;
    let receivedProps: SpyComponentProps;

    const SpyComponent = withDetailViewContext((props: SpyComponentProps) => {
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
                    <DetailView model="User">
                        <PostAction
                            label="Submit"
                            url="/api"
                            component={SpyComponent}
                        >
                            Post The Thing!
                        </PostAction>
                    </DetailView>
                </ModelProvider>
            );
        });

        it('renders any content passed as a child', () => {
            expect(wrapper.text()).to.equal('Post The Thing!');
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
                        <PostAction
                            url="/api"
                            component={SpyComponent}
                        />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('default label = "Submit"', () => {
            expect(receivedProps.label).to.equal('Submit');
        });

    });

    describe('IActionComponentProps - model loaded', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="User">
                        <PostAction
                            label="Submit"
                            url="/api"
                            component={SpyComponent}
                        />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('passes through label', () => {
            expect(receivedProps.label).to.equal('Submit');
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
                    <DetailView model="User" primaryKeyValue="1">
                        <PostAction
                            label="Submit"
                            url="/api"
                            component={SpyComponent}
                        />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('passes through label', () => {
            expect(receivedProps.label).to.equal('Submit');
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
        let fetchStub: sinon.SinonStub;
        let onResponseCallback: sinon.SinonSpy;
        let onErrorCallback: sinon.SinonSpy;
        let props: IPostActionProps;

        function render() {
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="User">
                        <PostAction {...props} />
                    </DetailView>
                </ModelProvider>
            );
        }

        beforeEach(() => {
            fetchStub = sinon.stub();
            onResponseCallback = sinon.spy();
            onErrorCallback = sinon.spy();
            global.fetch = fetchStub;

            resetSpyComponent();
            modelManager = models.getModelManager();
            props = {
                label: 'Submit',
                url: '/api',
                onResponse: onResponseCallback,
                onError: onErrorCallback,
                component: SpyComponent
            };
            render();
        });

        afterEach(() => {
            delete global.fetch;
        });

        function setupValidModel() {
            const user = new models.User({
                id: 100, name: 'Bob'
            });
            receivedProps.detailViewContext.model = user;
            return user;
        }

        it('sets loadState = "SAVING" when the action is triggered', () => {
            expect(receivedProps.detailViewContext.loadState).to.equal('NONE');
            receivedProps.doAction().catch((e) => null);
            expect(receivedProps.detailViewContext.loadState).to.equal('SAVING');
        });

        it('resets loadState and calls onError() if model is not valid', async () => {
            expect(receivedProps.detailViewContext.loadState).to.equal('NONE');

            await receivedProps.doAction();

            expect(onErrorCallback.callCount).to.equal(1);
            const err = onErrorCallback.getCall(0).args[0];
            expect(err).to.be.instanceof(rev.ValidationError);
            expect(err.validation).to.be.instanceof(ModelValidationResult);
            expect(err.validation.valid).to.be.false;
            expect(receivedProps.detailViewContext.loadState).to.equal('NONE');
        });

        it('calls fetch() with model data if model is valid', async () => {
            const user = setupValidModel();

            await receivedProps.doAction();

            expect(fetchStub.callCount).to.equal(1);
            expect(fetchStub.getCall(0).args[0]).to.equal('/api');
            expect(fetchStub.getCall(0).args[1]).to.deep.equal({
                method: 'post',
                body: JSON.stringify(user),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
            });
        });

        it('calls fetch() with alternative url and method if they are set', async () => {
            props.url = 'http://www.othersite.com/api';
            props.httpMethod = 'put';
            render();
            setupValidModel();

            await receivedProps.doAction();

            expect(fetchStub.callCount).to.equal(1);

            expect(fetchStub.getCall(0).args[0]).to.equal(props.url);
            expect(fetchStub.getCall(0).args[1].method).to.equal('put');
        });

        it('resets loadState and calls onResponse() if fetch is successful', async () => {
            expect(receivedProps.detailViewContext.loadState).to.equal('NONE');

            setupValidModel();
            const expectedResponse = { status: 200 };
            fetchStub.returns(Promise.resolve(expectedResponse));

            await receivedProps.doAction();

            expect(receivedProps.detailViewContext.loadState).to.equal('NONE');
            expect(onResponseCallback.callCount).to.equal(1);
            expect(onResponseCallback.getCall(0).args[0]).to.equal(expectedResponse);
        });

        it('resets loadState and calls onError() if fetch throws an error', async () => {
            expect(receivedProps.detailViewContext.loadState).to.equal('NONE');
            setupValidModel();

            const expectedError = new Error('Boom!!!');
            fetchStub.returns(Promise.reject(expectedError));

            await receivedProps.doAction();

            expect(onErrorCallback.callCount).to.equal(1);
            expect(onErrorCallback.getCall(0).args[0]).to.equal(expectedError);
            expect(receivedProps.detailViewContext.loadState).to.equal('NONE');
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
                        <PostAction
                            label="Submit"
                            url="/api"

                            disabled={(ctx: IDetailViewContext<models.User>) => {
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
            receivedProps.detailViewContext.model.name = 'should be disabled';
            receivedProps.detailViewContext.refresh();
            expect(receivedProps.disabled).to.be.true;
        });

    });

});