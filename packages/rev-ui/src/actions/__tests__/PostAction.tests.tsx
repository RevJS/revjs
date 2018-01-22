
import * as React from 'react';
import * as sinon from 'sinon';
import * as models from '../../__fixtures__/models';
import { expect } from 'chai';
import * as rev from 'rev-models';
import { mount, ReactWrapper } from 'enzyme';
import { ModelProvider } from '../../provider/ModelProvider';
import { DetailView, IModelContextProp } from '../../views/DetailView';
import { PostAction, IActionComponentProps, IPostActionProps } from '../PostAction';
import { withModelContext } from '../../views/withModelContext';
import { ModelValidationResult } from 'rev-models/lib/validation/validationresult';

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
                        <DetailView model="Post">
                            <Comp label="Submit" />
                        </DetailView>
                    </ModelProvider>);
            }).to.throw('you must specify the url property');
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

    describe('IActionComponentProps - model loaded', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
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
                    <DetailView model="Post" primaryKeyValue="1">
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
            receivedProps.modelContext.model = user;
            return user;
        }

        it('sets loadState = "SAVING" when the action is triggered', () => {
            expect(receivedProps.modelContext.loadState).to.equal('NONE');
            receivedProps.doAction().catch((e) => null);
            expect(receivedProps.modelContext.loadState).to.equal('SAVING');
        });

        it('resets loadState, calls onError() and throws the error if model is not valid', async () => {
            expect(receivedProps.modelContext.loadState).to.equal('NONE');
            try {
                await receivedProps.doAction();
                throw new Error('expected to throw');
            }
            catch (e) {
                expect(onErrorCallback.callCount).to.equal(1);
                expect(onErrorCallback.getCall(0).args[0]).to.equal(e);
                expect(e.message).to.equal('ValidationError');
                expect(e.validation).to.be.instanceof(ModelValidationResult);
                expect(e.validation.valid).to.be.false;
                expect(receivedProps.modelContext.loadState).to.equal('NONE');
            }
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

        it('resets loadState, calls onResponse() and returns response if fetch is successful', async () => {
            expect(receivedProps.modelContext.loadState).to.equal('NONE');

            setupValidModel();
            const expectedResponse = { status: 200 };
            fetchStub.returns(Promise.resolve(expectedResponse));

            const result = await receivedProps.doAction();

            expect(receivedProps.modelContext.loadState).to.equal('NONE');
            expect(result).to.equal(expectedResponse);
            expect(onResponseCallback.callCount).to.equal(1);
            expect(onResponseCallback.getCall(0).args[0]).to.equal(expectedResponse);
        });

        it('resets loadState, calls onError() and throws the error if fetch throws an error', async () => {
            expect(receivedProps.modelContext.loadState).to.equal('NONE');
            setupValidModel();
            const expectedError = new Error('Boom!!!');
            fetchStub.returns(Promise.reject(expectedError));
            try {
                await receivedProps.doAction();
                throw new Error('expected to throw');
            }
            catch (e) {
                expect(e).to.equal(expectedError);
                expect(onErrorCallback.callCount).to.equal(1);
                expect(onErrorCallback.getCall(0).args[0]).to.equal(e);
                expect(receivedProps.modelContext.loadState).to.equal('NONE');
            }
        });

    });

});