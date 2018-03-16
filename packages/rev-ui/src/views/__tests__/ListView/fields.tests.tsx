
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount } from 'enzyme';
import { sleep } from '../../../__test_utils__/utils';
import { ListView, lifecycleOptions, IListViewComponentProps } from '../../ListView';
import * as models from '../../../__fixtures__/models';
import { ModelManager, IModelMeta, fields } from 'rev-models';
import { ModelProvider } from '../../../provider/ModelProvider';
import { createData, IModelTestData } from '../../../__fixtures__/modeldata';

lifecycleOptions.enableComponentDidMount = true;

describe('ListView field tests', () => {

    let modelManager: ModelManager;
    const model = 'Post';
    let receivedProps: IListViewComponentProps;

    const SpyComponent: React.SFC<IListViewComponentProps> = (props) => {
        receivedProps = props;
        return <p>SpyComponent</p>;
    };

    function mountComponent(component: React.ReactNode) {
        return mount(
            <ModelProvider modelManager={modelManager}>
                {component}
            </ModelProvider>
        );
    }

    describe('with scalar Post fields selected', () => {
        const fieldList = ['id', 'title', 'published', 'post_date'];
        let meta: IModelMeta<models.Post>;
        let modelData: IModelTestData;
        let expectedFields: fields.Field[];

        before(async () => {
            modelManager = models.getModelManager();
            meta = modelManager.getModelMeta(models.Post);
            modelData = await createData(modelManager);
            expectedFields = fieldList.map((fieldName) => meta.fieldsByName[fieldName]);

            receivedProps = null;
            const wrapper = mountComponent(
                <ListView
                    title="List with Data Loaded..."
                    model={model}
                    fields={fieldList}
                    limit={100}
                    component={SpyComponent} />
            );
            await sleep(10);
            wrapper.update();
        });

        it('passes the expected fields list', () => {
            expect(receivedProps.fields).to.deep.equal(expectedFields);
        });

        it('passes the correct record data', () => {
            modelData.posts.forEach((record, recordIdx) => {
                fieldList.forEach((fieldName) => {
                    expect(receivedProps.records[recordIdx][fieldName])
                        .to.equal(record[fieldName]);
                });
            });
        });

    });

    describe('with a RelatedModel field selected', () => {
        let errorStub: sinon.SinonStub;

        before(async () => {
            modelManager = models.getModelManager();
            errorStub = sinon.stub(console, 'error');
        });

        after(() => {
            errorStub.restore();
        });

        it('An error is thrown if it is not included in the "related" list', () => {
            expect(() => {
                mountComponent(
                    <ListView
                        title="Test List"
                        model={model}
                        fields={['id', 'title', 'user']}
                        component={SpyComponent} />
                );
            }).to.throw(`To render the related model field 'user', it must be included in the "related" prop of the ListView.`);
        });

        it('Does not throw an error if the field is included in the "related" list', () => {
            expect(() => {
                mountComponent(
                    <ListView
                        title="Test List"
                        model={model}
                        fields={['id', 'title', 'user']}
                        related={['user']}
                        component={SpyComponent} />
                );
            }).not.to.throw();
        });

    });

    describe('with a RelatedModelList field selected', () => {
        let errorStub: sinon.SinonStub;

        before(async () => {
            modelManager = models.getModelManager();
            errorStub = sinon.stub(console, 'error');
        });

        after(() => {
            errorStub.restore();
        });

        it('throws an error because only RelatedModel fields are supported in ListViews', () => {
            expect(() => {
                mountComponent(
                    <ListView
                        title="Test List"
                        model={model}
                        fields={['id', 'title', 'comments']}
                        component={SpyComponent} />
                );
            }).to.throw(`Related model field 'comments' is invalid. Only RelatedModel fields are supported in ListViews currently.`);
        });

    });

});