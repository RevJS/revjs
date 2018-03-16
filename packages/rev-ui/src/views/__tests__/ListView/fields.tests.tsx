
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount } from 'enzyme';
import { sleep } from '../../../__test_utils__/utils';
import { ListView, lifecycleOptions, IListViewComponentProps, IListViewField } from '../../ListView';
import * as models from '../../../__fixtures__/models';
import { ModelManager, IModelMeta } from 'rev-models';
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
        let expectedFields: IListViewField[];

        before(async () => {
            modelManager = models.getModelManager();
            meta = modelManager.getModelMeta(models.Post);
            modelData = await createData(modelManager);

            expectedFields = fieldList.map((fieldName) => ({
                fieldName: fieldName,
                field: meta.fieldsByName[fieldName]
            }));

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

    describe.skip('with a Related Post field selected', () => {
        let errorStub: sinon.SinonStub;

        before(async () => {
            modelManager = models.getModelManager();
            errorStub = sinon.stub(console, 'error');
        });

        after(() => {
            errorStub.restore();
        });

        it('throws an error because RelatedModelList fields are not yet supported in ListViews', () => {
            expect(() => {
                mountComponent(
                    <ListView
                        title="Test List"
                        model={model}
                        fields={['id', 'title', 'comments']}
                        component={SpyComponent} />
                );
            }).to.throw(`The related lookup field 'comments.blah' is invalid. Only RelatedModel fields are currently supported.`);
        });

    });

});