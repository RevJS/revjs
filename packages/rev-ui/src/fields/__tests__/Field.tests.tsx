
import * as React from 'react';
import * as sinon from 'sinon';
import * as models from '../../__fixtures__/models';
import { createData, IModelTestData } from '../../__fixtures__/modeldata';
import { expect } from 'chai';
import * as rev from 'rev-models';
import { mount } from 'enzyme';
import { ModelProvider } from '../../provider/ModelProvider';
import { Field, IFieldComponentProps } from '../Field';
import { sleep } from '../../__test_utils__/utils';
import { DetailView, IDetailViewContextProp } from '../../views/DetailView';
import { withDetailViewContext } from '../../views/withDetailViewContext';

describe('Field', () => {

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

        it('throws error when not nested inside a DetailView', () => {
            expect(() => {
                mount(<Field name="title" />);
            }).to.throw('must be nested inside a DetailView');
        });

        it('throws error when specified field does not exist on the model', () => {
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <Field name="colour" />
                    </DetailView>
                </ModelProvider>);
            }).to.throw(`Model 'Post' does not have a field called 'colour'`);
        });

    });

    type SpyComponentProps = IFieldComponentProps & IDetailViewContextProp;
    let receivedProps: SpyComponentProps;
    let renderCount: number;

    const SpyComponent = withDetailViewContext<IFieldComponentProps>((props) => {
        receivedProps = props;
        renderCount++;
        return <p>SpyComponent</p>;
    });

    function resetSpyComponent() {
        receivedProps = null as any;
        renderCount = 0;
    }

    describe('IFieldComponentProps - before model data has loaded', () => {
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
                    <DetailView model="Post" primaryKeyValue="1">
                        <Field
                            name="title"
                            component={SpyComponent} />
                    </DetailView>
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

        it('passes undefined value', () => {
            expect(receivedProps.value).to.be.undefined;
        });

        it('passes empty list of field errors', () => {
            expect(receivedProps.errors).to.deep.equal([]);
        });

        it('disabled = true', () => {
            expect(receivedProps.disabled).to.be.true;
        });

        it('passes event handlers', () => {
            expect(receivedProps.onChange).to.be.a('function');
        });

    });

    describe('IFieldComponentProps - when model data has loaded', () => {
        let modelManager: rev.ModelManager;
        let meta: rev.IModelMeta<models.Post>;
        let modelData: IModelTestData;

        before(async () => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            modelData = await createData(modelManager);
            meta = modelManager.getModelMeta('Post');
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post" primaryKeyValue="1">
                        <Field
                            name="title"
                            component={SpyComponent} />
                    </DetailView>
                </ModelProvider>
            );
            await sleep(10);
        });

        it('component has rendered twice (loading, loaded)', () => {
            expect(renderCount).to.equal(2);
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

        it('passes correct field value', () => {
            expect(receivedProps.value).to.equal(modelData.posts[0].title);
        });

        it('passes empty list of field errors', () => {
            expect(receivedProps.errors).to.deep.equal([]);
        });

        it('disabled = false', () => {
            expect(receivedProps.disabled).to.be.false;
        });

        it('passes event handlers', () => {
            expect(receivedProps.onChange).to.be.a('function');
        });

    });

    describe('colspan properties', () => {
        let modelManager: rev.ModelManager;

        function doMount(component: any) {
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        {component}
                    </DetailView>
                </ModelProvider>
            );
        }

        beforeEach(() => {
            resetSpyComponent();
        });

        it('default colspans are 12, 6, 6', () => {
            doMount(<Field name="title" component={SpyComponent} />);
            expect(receivedProps.colspanNarrow).to.equal(12);
            expect(receivedProps.colspan).to.equal(6);
            expect(receivedProps.colspanWide).to.equal(6);
        });

        it('can override colspanNarrow', () => {
            doMount(<Field name="title" component={SpyComponent}
                colspanNarrow={6}
            />);
            expect(receivedProps.colspanNarrow).to.equal(6);
            expect(receivedProps.colspan).to.equal(6);
            expect(receivedProps.colspanWide).to.equal(6);
        });

        it('can override colspan, and it also overrides colspanWide', () => {
            doMount(<Field name="title" component={SpyComponent}
                colspan={4}
            />);
            expect(receivedProps.colspanNarrow).to.equal(12);
            expect(receivedProps.colspan).to.equal(4);
            expect(receivedProps.colspanWide).to.equal(4);
        });

        it('can override colspanWide', () => {
            doMount(<Field name="title" component={SpyComponent}
                colspanWide={4}
            />);
            expect(receivedProps.colspanNarrow).to.equal(12);
            expect(receivedProps.colspan).to.equal(6);
            expect(receivedProps.colspanWide).to.equal(4);
        });

        it('can override all colspans', () => {
            doMount(<Field name="title" component={SpyComponent}
                colspanNarrow={1}
                colspan={2}
                colspanWide={3}
            />);
            expect(receivedProps.colspanNarrow).to.equal(1);
            expect(receivedProps.colspan).to.equal(2);
            expect(receivedProps.colspanWide).to.equal(3);
        });
    });

    describe('Field Component Configuration', () => {
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
                    <DetailView model="ModelWithUnknownField">
                        <Field name="test" />
                    </DetailView>
                </ModelProvider>);
            }).to.throw(`Field Error: There is no UI_COMPONENT registered for field type \'UnknownField\'`);
        });

    });

    describe('Standard Component Properties', () => {
        let modelManager: rev.ModelManager;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <Field
                            name="title"
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

    describe('Event Handlers', () => {
        let modelManager: rev.ModelManager;

        beforeEach(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <Field
                            name="title"
                            component={SpyComponent} />
                    </DetailView>
                </ModelProvider>
            );
        });

        describe('onChange()', () => {

            it('updates field value', () => {
                expect(receivedProps.value).to.be.undefined;
                receivedProps.onChange('Awesome Post');
                expect(receivedProps.value).to.equal('Awesome Post');
            });

            it('sets the "dirty" property in the detailViewContext', () => {
                expect(receivedProps.detailViewContext.dirty).to.be.false;
                receivedProps.onChange('Awesome Post');
                expect(receivedProps.detailViewContext.dirty).to.be.true;
            });

        });

    });

});