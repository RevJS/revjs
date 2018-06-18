
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

describe('Field - related field tests', () => {

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

        it('throws error if field name hierarchy is more than 2 levels deep', () => {
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <Field name="user.permissions.blah" />
                    </DetailView>
                </ModelProvider>);
            }).to.throw(`invalid field 'user.permissions.blah'. Currently only 2 levels of field hierarchy are supported.`);
        });

        it('with 2-level hierarchy, throws error when parent field is not selected in detail view', () => {
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                    <DetailView model="Post">
                        <Field name="user.name" />
                    </DetailView>
                </ModelProvider>);
            }).to.throw(`invalid field 'user.name'. Related field 'user' is not selected in parent DetailView.`);
        });

        it('with 2-level hierarchy, throws error when sub-field does not exist on related model', () => {
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                    <DetailView model="Post" related={['user']}>
                        <Field name="user.flibble" />
                    </DetailView>
                </ModelProvider>);
            }).to.throw(`invalid field 'user.flibble'. Field 'flibble' does not exist on model 'User'.`);
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
        let relMeta: rev.IModelMeta<models.User>;

        before(() => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            relMeta = modelManager.getModelMeta('User');
            const backend = modelManager.getBackend('default') as rev.InMemoryBackend;
            backend.OPERATION_DELAY = 100;
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post" primaryKeyValue="1" related={['user']}>
                        <Field
                            name="user.name"
                            component={SpyComponent} />
                    </DetailView>
                </ModelProvider>
            );
        });

        it('passes specified field object', () => {
            const expectedField = relMeta.fieldsByName['name'];
            expect(receivedProps.field).to.equal(expectedField);
        });

        it('passes label, which should equal the field label or field name', () => {
            const f = relMeta.fieldsByName['name'];
            const expectedLabel = f.options.label || f.name;
            expect(receivedProps.label).to.equal(expectedLabel);
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
        let relMeta: rev.IModelMeta<models.Post>;
        let modelData: IModelTestData;

        before(async () => {
            resetSpyComponent();
            modelManager = models.getModelManager();
            modelData = await createData(modelManager);
            relMeta = modelManager.getModelMeta('User');
            mount(
                <ModelProvider modelManager={modelManager}>
                    <DetailView model="Post" primaryKeyValue="1" related={['user']}>
                        <Field
                            name="user.name"
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
            const expectedField = relMeta.fieldsByName['name'];
            expect(receivedProps.field).to.equal(expectedField);
        });

        it('passes correct field value', () => {
            expect(receivedProps.value).to.equal(modelData.posts[0].user.name);
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

    // describe('Event Handlers', () => {
    //     let modelManager: rev.ModelManager;

    //     beforeEach(() => {
    //         resetSpyComponent();
    //         modelManager = models.getModelManager();
    //         mount(
    //             <ModelProvider modelManager={modelManager}>
    //                 <DetailView model="Post">
    //                     <Field
    //                         name="title"
    //                         component={SpyComponent} />
    //                 </DetailView>
    //             </ModelProvider>
    //         );
    //     });

    //     describe('onChange()', () => {

    //         it('updates field value', () => {
    //             expect(receivedProps.value).to.be.undefined;
    //             receivedProps.onChange('Awesome Post');
    //             expect(receivedProps.value).to.equal('Awesome Post');
    //         });

    //         it('sets the "dirty" property in the detailViewContext', () => {
    //             expect(receivedProps.detailViewContext.dirty).to.be.false;
    //             receivedProps.onChange('Awesome Post');
    //             expect(receivedProps.detailViewContext.dirty).to.be.true;
    //         });

    //     });

    // });

});