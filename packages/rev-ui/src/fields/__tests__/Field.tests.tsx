
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as sinon from 'sinon';
import * as models from '../../__fixtures__/models';
import { createData, IModelTestData } from '../../__fixtures__/modeldata';
import { expect } from 'chai';
import * as rev from 'rev-models';
import { mount, ReactWrapper } from 'enzyme';
import { ModelProvider } from '../../provider/ModelProvider';
import { Field, IFieldComponentProps } from '../Field';
import { sleep } from '../../__test_utils__/utils';
import { ModelValidationResult } from 'rev-models/lib/validation/validationresult';
import { DetailView } from '../../views/DetailView';

describe.only('Field', () => {

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

    let receivedProps: IFieldComponentProps;

    const SpyComponent: React.SFC<IFieldComponentProps> = (props) => {
        receivedProps = props;
        return <p>SpyComponent</p>;
    };

    function resetSpyComponent() {
        receivedProps = null;
    }

    describe('field props - before model has loaded', () => {
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

        it('passes null value', () => {
            expect(receivedProps.value).to.be.null;
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

    // describe('initial modelContext - when primaryKeyValue is not specified', () => {
    //     let modelManager: rev.ModelManager;

    //     before(() => {
    //         resetSpyComponent();
    //         modelManager = models.getModelManager();
    //         mount(
    //             <ModelProvider modelManager={modelManager}>
    //                 <DetailView model="Post">
    //                     <TestView />
    //                 </DetailView>
    //             </ModelProvider>
    //         );
    //     });

    //     it('passes modelContext to contained Views', () => {
    //         expect(receivedProps).not.to.be.null;
    //     });

    //     it('does not trigger a data load', () => {
    //         expect(receivedProps.loadState).to.equal('NONE');
    //     });

    //     it('contains the current ModelManager', () => {
    //         expect(receivedProps.manager).to.equal(modelManager);
    //     });

    //     it('a new model instance is created', () => {
    //         expect(receivedProps.model).not.to.be.null;
    //         expect(receivedProps.model).to.be.instanceof(models.Post);
    //         expect(modelManager.isNew(receivedProps.model)).to.be.true;
    //     });

    //     it('modelMeta is set', () => {
    //         expect(receivedProps.modelMeta).to.deep.equal(modelManager.getModelMeta('Post'));
    //     });

    //     it('validation information is null', () => {
    //         expect(receivedProps.validation).to.be.null;
    //     });

    //     it('dirty is false', () => {
    //         expect(receivedProps.dirty).to.be.false;
    //     });

    // });

    // describe('modelContext after successful model load', () => {
    //     let modelManager: rev.ModelManager;
    //     let expectedData: IModelTestData;

    //     before(async () => {
    //         resetTestView();
    //         modelManager = models.getModelManager();
    //         expectedData = await createData(modelManager);
    //         mount(
    //             <ModelProvider modelManager={modelManager}>
    //                 <DetailView model="Post" primaryKeyValue="1">
    //                     <TestView />
    //                 </DetailView>
    //             </ModelProvider>
    //         );
    //         await sleep(10);
    //     });

    //     it('component has rendered twice', () => {
    //         expect(renderCount).to.equal(2);
    //     });

    //     it('loadState is set back to NONE', () => {
    //         expect(receivedProps.loadState).to.equal('NONE');
    //     });

    //     it('model data is the requested model instance', () => {
    //         const ctx = receivedProps;
    //         expect(ctx.model).to.be.instanceof(models.Post);
    //         expect(ctx.model.id).to.equal(expectedData.posts[0].id);
    //         expect(ctx.model.title).to.equal(expectedData.posts[0].title);
    //     });

    //     it('modelMeta is set', () => {
    //         expect(receivedProps.modelMeta).to.deep.equal(modelManager.getModelMeta('Post'));
    //     });

    //     it('validation information is null', () => {
    //         expect(receivedProps.validation).to.be.null;
    //     });

    //     it('dirty is false', () => {
    //         expect(receivedProps.dirty).to.be.false;
    //     });

    // });

    // describe('setDirty()', () => {
    //     let modelManager: rev.ModelManager;

    //     before(() => {
    //         resetTestView();
    //         modelManager = models.getModelManager();
    //         mount(
    //             <ModelProvider modelManager={modelManager}>
    //                 <DetailView model="Post">
    //                     <TestView />
    //                 </DetailView>
    //             </ModelProvider>
    //         );
    //     });

    //     it('setDirty() is passed in modelContext', () => {
    //         expect(receivedProps.setDirty).to.be.a('function');
    //     });

    //     it('modelContext.dirty is false by default', () => {
    //         expect(receivedProps.dirty).to.be.false;
    //     });

    //     it('initial render has completed', () => {
    //         expect(renderCount).to.equal(1);
    //     });

    //     it('setDirty() changes the value of dirty and forces a re-render', () => {
    //         receivedProps.setDirty(true);
    //         expect(receivedProps.dirty).to.equal(true);
    //         expect(renderCount).to.equal(2);
    //     });

    //     it('setDirty() does not force a re-render if dirty value has not changed', () => {
    //         receivedProps.setDirty(true);
    //         expect(renderCount).to.equal(2);
    //     });

    // });

    // describe('validate()', () => {
    //     let modelManager: rev.ModelManager;

    //     before(() => {
    //         resetTestView();
    //         modelManager = models.getModelManager();
    //         mount(
    //             <ModelProvider modelManager={modelManager}>
    //                 <DetailView model="Post">
    //                     <TestView />
    //                 </DetailView>
    //             </ModelProvider>
    //         );
    //     });

    //     it('validate() is passed in modelContext', () => {
    //         expect(receivedProps.setDirty).to.be.a('function');
    //     });

    //     it('modelContext.validation is null by default', () => {
    //         expect(receivedProps.validation).to.be.null;
    //     });

    //     it('initial render has completed', () => {
    //         expect(renderCount).to.equal(1);
    //     });

    //     it('validate() triggers validation of the model, re-renders, and returns result', async () => {
    //         let result = await receivedProps.validate();
    //         expect(result).to.be.instanceof(ModelValidationResult);
    //         expect(receivedProps.validation).to.equal(result);
    //         expect(renderCount).to.equal(2);
    //     });

    // });

    // describe('rendering', () => {
    //     let modelManager: rev.ModelManager;
    //     let wrapper: ReactWrapper;

    //     before(() => {
    //         modelManager = models.getModelManager();
    //         wrapper = mount(
    //             <ModelProvider modelManager={modelManager}>
    //                 <DetailView model="Post">
    //                     <span>content</span>
    //                 </DetailView>
    //             </ModelProvider>
    //         );
    //     });

    //     it('renders children directly', () => {
    //         expect(wrapper.at(0).text()).to.equal('content');
    //     });

    // });

});