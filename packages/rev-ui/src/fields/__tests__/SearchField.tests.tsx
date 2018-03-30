
import * as React from 'react';
import * as sinon from 'sinon';
import * as models from '../../__fixtures__/models';
import { expect } from 'chai';
import * as rev from 'rev-models';
import { mount } from 'enzyme';
import { ModelProvider } from '../../provider/ModelProvider';
import { SearchField, ISearchFieldComponentProps } from '../SearchField';
import { SearchView, ISearchViewContextProp } from '../../views/SearchView';
import { withSearchViewContext } from '../../views/withSearchViewContext';

describe('SearchField', () => {

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

        it('throws error when not nested inside a SearchView', () => {
            expect(() => {
                mount(<SearchField name="title" />);
            }).to.throw('must be nested inside a SearchView');
        });

        it('throws error when specified field does not exist on the model', () => {
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                    <SearchView model="Post" onSearch={() => null}>
                        <SearchField name="colour" />
                    </SearchView>
                </ModelProvider>);
            }).to.throw(`Model 'Post' does not have a field called 'colour'`);
        });

    });

    type SpyComponentProps = ISearchFieldComponentProps & ISearchViewContextProp;
    let receivedProps: SpyComponentProps;

    const SpyComponent = withSearchViewContext<ISearchFieldComponentProps>((props) => {
        receivedProps = props;
        return <p>SpyComponent</p>;
    });

    function resetSpyComponent() {
        receivedProps = null;
    }

    describe('ISearchFieldComponentProps', () => {
        let modelManager: rev.ModelManager;
        let meta: rev.IModelMeta<models.Post>;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            meta = modelManager.getModelMeta('Post');
            const backend = modelManager.getBackend('default') as rev.InMemoryBackend;
            backend.OPERATION_DELAY = 100;
            mount(
                <ModelProvider modelManager={modelManager}>
                    <SearchView model="Post" onSearch={() => null}>
                        <SearchField
                            name="title"
                            component={SpyComponent} />
                    </SearchView>
                </ModelProvider>
            );
        });

        it('passes specified field object', () => {
            const expectedField = meta.fieldsByName['title'];
            expect(receivedProps.field).to.equal(expectedField);
        });

        it('passes label, which should equal the field label or field name', () => {
            const f = meta.fieldsByName['title'];
            const expectedLabel = f.options.label || f.name;
            expect(receivedProps.label).to.equal(expectedLabel);
        });

        it('passes default colspans', () => {
            expect(receivedProps.colspanNarrow).to.equal(12);
            expect(receivedProps.colspan).to.equal(6);
            expect(receivedProps.colspanWide).to.equal(6);
        });

        it('passes undefined criteria', () => {
            expect(receivedProps.criteria).to.be.undefined;
        });

        it('passes event handlers', () => {
            expect(receivedProps.onCriteriaChange).to.be.a('function');
        });

    });

    describe('colspan properties', () => {
        let modelManager: rev.ModelManager;

        function doMount(component: any) {
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <SearchView model="Post" onSearch={() => null}>
                        {component}
                    </SearchView>
                </ModelProvider>
            );
        }

        beforeEach(() => {
            resetSpyComponent();
        });

        it('default colspans are 12, 6, 6', () => {
            doMount(<SearchField name="title" component={SpyComponent} />);
            expect(receivedProps.colspanNarrow).to.equal(12);
            expect(receivedProps.colspan).to.equal(6);
            expect(receivedProps.colspanWide).to.equal(6);
        });

        it('can override colspanNarrow', () => {
            doMount(<SearchField name="title" component={SpyComponent}
                colspanNarrow={6}
            />);
            expect(receivedProps.colspanNarrow).to.equal(6);
            expect(receivedProps.colspan).to.equal(6);
            expect(receivedProps.colspanWide).to.equal(6);
        });

        it('can override colspan, and it also overrides colspanWide', () => {
            doMount(<SearchField name="title" component={SpyComponent}
                colspan={4}
            />);
            expect(receivedProps.colspanNarrow).to.equal(12);
            expect(receivedProps.colspan).to.equal(4);
            expect(receivedProps.colspanWide).to.equal(4);
        });

        it('can override colspanWide', () => {
            doMount(<SearchField name="title" component={SpyComponent}
                colspanWide={4}
            />);
            expect(receivedProps.colspanNarrow).to.equal(12);
            expect(receivedProps.colspan).to.equal(6);
            expect(receivedProps.colspanWide).to.equal(4);
        });

        it('can override all colspans', () => {
            doMount(<SearchField name="title" component={SpyComponent}
                colspanNarrow={1}
                colspan={2}
                colspanWide={3}
            />);
            expect(receivedProps.colspanNarrow).to.equal(1);
            expect(receivedProps.colspan).to.equal(2);
            expect(receivedProps.colspanWide).to.equal(3);
        });
    });

    describe('SearchField Component Configuration', () => {
        let modelManager: rev.ModelManager;
        let errorStub: sinon.SinonStub;

        beforeEach(() => {
            modelManager = models.getModelManager();
            errorStub = sinon.stub(console, 'error');
        });

        afterEach(() => {
            errorStub.restore();
        });

        it('throws render error when a field type does not have a component registered', () => {
            class ModelWithUnknownField {
                test: string;
            }
            class UnknownField extends rev.fields.Field {}
            modelManager.register(ModelWithUnknownField, { fields: [
                new UnknownField('test')
            ]});

            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                    <SearchView model="ModelWithUnknownField" onSearch={() => null}>
                        <SearchField name="test" />
                    </SearchView>
                </ModelProvider>);
            }).to.throw(`SearchField Error: There is no UI_COMPONENT registered for field type \'UnknownField\'`);
        });

    });

    describe('Standard Component Properties', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <SearchView model="Post" onSearch={() => null}>
                        <SearchField
                            name="title"
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

    describe('Event Handlers', () => {
        let modelManager: rev.ModelManager;

        beforeEach(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <SearchView model="Post" onSearch={() => null}>
                        <SearchField
                            name="title"
                            component={SpyComponent} />
                    </SearchView>
                </ModelProvider>
            );
        });

        describe('onCriteriaChange()', () => {

            it('updates field criteria', () => {
                expect(receivedProps.criteria).to.be.undefined;
                receivedProps.onCriteriaChange({ _eq: 10 });
                expect(receivedProps.criteria).to.deep.equal({ _eq: 10 });
            });

            it('removes criteria when criteria is null', () => {
                receivedProps.onCriteriaChange({ _eq: 10 });
                expect(receivedProps.criteria).to.deep.equal({ _eq: 10 });
                receivedProps.onCriteriaChange(null);
                expect(receivedProps.criteria).to.be.undefined;
            });

        });

    });

});