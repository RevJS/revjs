
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as sinon from 'sinon';
import * as models from '../../../__fixtures__/models';
import { expect } from 'chai';
import * as rev from 'rev-models';
import { mount, ReactWrapper } from 'enzyme';
import { ModelProvider } from '../../../provider/ModelProvider';
import { SearchView, ISearchViewContext, ISearchViewProps } from '../../SearchView';

describe('SearchView', () => {

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
                mount(<SearchView model="Post" onSearch={() => null} />);
            }).to.throw('must be nested inside a ModelProvider');
        });

        it('throws error when specified model does not exist', () => {
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                    <SearchView model="NonExistey" onSearch={() => null} />
                </ModelProvider>);
            }).to.throw(`Model 'NonExistey' is not registered`);
        });

    });

    let receivedSearchViewContext: ISearchViewContext;

    class TestView extends React.Component {
        static contextTypes = {
            modelManager: PropTypes.object,
            searchViewContext: PropTypes.object
        };
        constructor(props: any, context: any) {
            super(props, context);
            receivedSearchViewContext = this.context.searchViewContext;
        }
        render() {
            return <p>SpyComponent</p>;
        }
    }

    function resetTestView() {
        receivedSearchViewContext = null as any;
    }

    describe('initial searchViewContext', () => {
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
                    <SearchView model="ModelNoPK" onSearch={() => null}>
                        <TestView />
                    </SearchView>
                </ModelProvider>
            );
        });

        it('passes searchViewContext to contained Views', () => {
            expect(receivedSearchViewContext).not.to.be.null;
        });

        it('contains the current ModelManager', () => {
            expect(receivedSearchViewContext.manager).to.equal(modelManager);
        });

        it('default where clause == {}', () => {
            expect(receivedSearchViewContext.where).not.to.be.null;
            expect(receivedSearchViewContext.where).to.deep.equal({});
        });

        it('modelMeta is set', () => {
            expect(receivedSearchViewContext.modelMeta).to.deep.equal(modelManager.getModelMeta('ModelNoPK'));
        });

    });

    describe('search()', () => {
        let modelManager: rev.ModelManager;
        let onSearchSpy: sinon.SinonSpy;

        before(() => {
            resetTestView();
            modelManager = models.getModelManager();
            onSearchSpy = sinon.spy();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <SearchView model="Post" onSearch={onSearchSpy}>
                        <TestView />
                    </SearchView>
                </ModelProvider>
            );
        });

        it('search() is passed in searchViewContext', () => {
            expect(receivedSearchViewContext.search).to.be.a('function');
        });

        it('search() passes current where clause to onSearch() listener', () => {
            receivedSearchViewContext.where['test'] = 1;
            receivedSearchViewContext.search();
            expect(onSearchSpy.callCount).to.equal(1);
            expect(onSearchSpy.getCall(0).args[0]).to.deep.equal({ test: 1 });
        });

        it('the where clause that is passed is a copy of the internal object', () => {
            const internalWhere = receivedSearchViewContext.where;
            expect(onSearchSpy.callCount).to.equal(1);
            expect(onSearchSpy.getCall(0).args[0]).to.deep.equal(internalWhere);
            expect(onSearchSpy.getCall(0).args[0]).not.to.equal(internalWhere);
        });

    });

    describe('rendering', () => {
        let modelManager: rev.ModelManager;
        let wrapper: ReactWrapper;

        before(() => {
            modelManager = models.getModelManager();
            wrapper = mount(
                <ModelProvider modelManager={modelManager}>
                    <SearchView model="Post" onSearch={() => null}>
                        <span>content</span>
                    </SearchView>
                </ModelProvider>
            );
        });

        it('renders children directly', () => {
            expect(wrapper.at(0).text()).to.equal('content');
        });

    });

    describe('Standard Component Properties', () => {
        let modelManager: rev.ModelManager;
        let receivedProps: ISearchViewProps;

        const SpyComponent = (props: any) => {
            receivedProps = props;
            return <p>SpyComponent</p>;
        };

        before(() => {
            receivedProps = null as any;
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <SearchView
                        model="Post"
                        onSearch={() => null}
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

});
