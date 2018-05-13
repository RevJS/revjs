
import * as React from 'react';
import * as sinon from 'sinon';
import * as models from '../../__fixtures__/models';
import { expect } from 'chai';
import * as rev from 'rev-models';
import { mount, ReactWrapper } from 'enzyme';
import { ModelProvider } from '../../provider/ModelProvider';
import { SearchView, ISearchViewContextProp } from '../../views/SearchView';
import { SearchAction } from '../SearchAction';
import { withSearchViewContext } from '../../views/withSearchViewContext';
import { IActionComponentProps } from '../types';

describe('SearchAction', () => {

    describe('construction', () => {
        let errorStub: sinon.SinonStub;

        beforeEach(() => {
            errorStub = sinon.stub(console, 'error');
        });

        afterEach(() => {
            errorStub.restore();
        });

        it('throws error when not nested inside a SearchView', () => {
            expect(() => {
                mount(<SearchAction label="Save" />);
            }).to.throw('must be nested inside a SearchView');
        });

    });

    type SpyComponentProps = IActionComponentProps & ISearchViewContextProp;
    let receivedProps: SpyComponentProps;

    const SpyComponent = withSearchViewContext<IActionComponentProps>((props) => {
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
                    <SearchView model="Post" onSearch={() => null}>
                        <SearchAction
                            label="Search"
                            component={SpyComponent}
                        >
                            Search Stuff
                        </SearchAction>
                    </SearchView>
                </ModelProvider>
            );
        });

        it('renders any content passed as a child', () => {
            expect(wrapper.text()).to.equal('Search Stuff');
        });

    });

    describe('IActionComponentProps - default label', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <SearchView model="Post" onSearch={() => null}>
                        <SearchAction
                            component={SpyComponent}
                        />
                    </SearchView>
                </ModelProvider>
            );
        });

        it('default label = "Search"', () => {
            expect(receivedProps.label).to.equal('Search');
        });

    });

    describe('IActionComponentProps', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <SearchView model="Post" onSearch={() => null}>
                        <SearchAction
                            label="Search Things"
                            component={SpyComponent}
                        />
                    </SearchView>
                </ModelProvider>
            );
        });

        it('passes through label', () => {
            expect(receivedProps.label).to.equal('Search Things');
        });

        it('disabled = false', () => {
            expect(receivedProps.disabled).to.be.false;
        });

        it('passes through doAction() function', () => {
            expect(receivedProps.doAction).to.be.a('function');
        });

    });

    describe('doAction()', () => {
        let modelManager: rev.ModelManager;
        let onSearchSpy: sinon.SinonSpy;

        before(() => {
            onSearchSpy = sinon.spy();
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <SearchView model="Post" onSearch={onSearchSpy}>
                        <SearchAction
                            label="Search Things"
                            component={SpyComponent}
                        />
                    </SearchView>
                </ModelProvider>
            );
        });

        it('doAction() causes the onSearch() callback to be called', () => {
            expect(onSearchSpy.callCount).to.equal(0);
            receivedProps.doAction();
            expect(onSearchSpy.callCount).to.equal(1);
        });

    });

    describe('Standard Props', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <SearchView model="Post" onSearch={() => null}>
                        <SearchAction
                            label="Search"
                            component={SpyComponent}
                            style={{marginTop: 10}}
                        />
                    </SearchView>
                </ModelProvider>
            );
        });

        it('style prop is passed to rendered component', () => {
            expect(receivedProps.style).to.deep.equal({marginTop: 10});
        });

    });

});