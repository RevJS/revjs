
import * as React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { sleep } from '../../../__test_utils__/utils';
import { ListView, lifecycleOptions, IListViewComponentProps } from '../../ListView';
import * as models from '../../../__fixtures__/models';
import { ModelManager, IModelMeta, fields } from 'rev-models';
import { ModelProvider } from '../../../provider/ModelProvider';
import { createData, IModelTestData } from '../../../__fixtures__/modeldata';

describe('ListView data & pagination', () => {

    let modelManager: ModelManager;
    const model = 'Post';
    let receivedProps: IListViewComponentProps;

    const SpyComponent: React.SFC<IListViewComponentProps> = (props) => {
        receivedProps = props;
        return <p>SpyComponent</p>;
    };

    before(() => {
        modelManager = models.getModelManager();
    });

    function mountComponent(component: React.ReactNode) {
        return mount(
            <ModelProvider modelManager={modelManager}>
                {component}
            </ModelProvider>
        );
    }

    describe('when data has loaded - first page', () => {
        const fieldList = ['id', 'title', 'published', 'post_date'];
        const rowLimit = 3;
        let meta: IModelMeta<models.Post>;
        let modelData: IModelTestData;
        let expectedData: models.Post[];
        let expectedFields: fields.Field[];

        before(async () => {
            modelManager = models.getModelManager();
            meta = modelManager.getModelMeta(models.Post);
            modelData = await createData(modelManager);
            expectedData = modelData.posts.slice(0, 3);
            expectedFields = fieldList.map((fieldName) => meta.fieldsByName[fieldName]);

            lifecycleOptions.enableComponentDidMount = true;
            receivedProps = null;
            const wrapper = mountComponent(
                <ListView
                    title="List with Data Loaded..."
                    model={model}
                    fields={fieldList}
                    limit={rowLimit}
                    component={SpyComponent} />
            );
            await sleep(10);
            wrapper.update();
        });

        it('record numbers are set based on offset + limut', () => {
            expect(receivedProps.firstRecordNumber).to.equal(1);
            expect(receivedProps.lastRecordNumber).to.equal(rowLimit);
            expect(receivedProps.totalCount).to.equal(modelData.posts.length);
        });

        it('the go-back button is disabled', () => {
            expect(receivedProps.backButtonDisabled).to.be.true;
        });

        it('the go-forward button is not disabled', () => {
            expect(receivedProps.forwardButtonDisabled).to.be.false;
        });

        it('passes the fields list', () => {
            expect(receivedProps.fields).to.deep.equal(expectedFields);
        });

        it('passes the correct record data', () => {
            expectedData.forEach((record, recordIdx) => {
                fieldList.forEach((fieldName) => {
                    expect(receivedProps.records[recordIdx][fieldName])
                        .to.equal(record[fieldName]);
                });
            });
        });

    });

    describe('when data has loaded, and I go to the 2nd page', () => {
        const fieldList = ['id', 'title', 'published', 'post_date'];
        const rowLimit = 3;
        let modelData: IModelTestData;
        let expectedData: models.Post[];

        before(async () => {
            modelManager = models.getModelManager();
            modelData = await createData(modelManager);
            expectedData = modelData.posts.slice(3, 6);

            lifecycleOptions.enableComponentDidMount = true;
            receivedProps = null;
            const wrapper = mountComponent(
                <ListView
                    title="List with Data Loaded..."
                    model={model}
                    fields={fieldList}
                    limit={rowLimit}
                    component={SpyComponent}
                />);
            await sleep(10);
            wrapper.update();
            receivedProps.onForwardButtonPress();
            await sleep(10);
            wrapper.update();
        });

        it('record numbers are set based on offset + limut', () => {
            expect(receivedProps.firstRecordNumber).to.equal(4);
            expect(receivedProps.lastRecordNumber).to.equal(6);
            expect(receivedProps.totalCount).to.equal(modelData.posts.length);
        });

        it('the go-back button is not disabled', () => {
            expect(receivedProps.backButtonDisabled).to.be.false;
        });

        it('the go-forward button is not disabled', () => {
            expect(receivedProps.forwardButtonDisabled).to.be.false;
        });

        it('passes the correct record data', () => {
            expectedData.forEach((record, recordIdx) => {
                fieldList.forEach((fieldName) => {
                    expect(receivedProps.records[recordIdx][fieldName])
                        .to.equal(record[fieldName]);
                });
            });
        });

    });

    describe('when data has loaded, and I go to the 3rd page', () => {
        const fieldList = ['id', 'title', 'published', 'post_date'];
        const rowLimit = 3;
        let modelData: IModelTestData;
        let expectedData: models.Post[];

        before(async () => {
            modelManager = models.getModelManager();
            modelData = await createData(modelManager);
            expectedData = modelData.posts.slice(6);

            lifecycleOptions.enableComponentDidMount = true;
            receivedProps = null;
            const wrapper = mountComponent(
                <ListView
                    title="List with Data Loaded..."
                    model={model}
                    fields={fieldList}
                    limit={rowLimit}
                    component={SpyComponent}
                />);
            await sleep(10);
            wrapper.update();
            receivedProps.onForwardButtonPress();
            await sleep(10);
            wrapper.update();
            receivedProps.onForwardButtonPress();
            await sleep(10);
            wrapper.update();
        });

        it('record numbers are set based on offset + limut', () => {
            expect(receivedProps.firstRecordNumber).to.equal(7);
            expect(receivedProps.lastRecordNumber).to.equal(modelData.posts.length);
            expect(receivedProps.totalCount).to.equal(modelData.posts.length);
        });

        it('the go-back button is not disabled', () => {
            expect(receivedProps.backButtonDisabled).to.be.false;
        });

        it('the go-forward button is disabled', () => {
            expect(receivedProps.forwardButtonDisabled).to.be.true;
        });

        it('passes the correct record data', () => {
            expectedData.forEach((record, recordIdx) => {
                fieldList.forEach((fieldName) => {
                    expect(receivedProps.records[recordIdx][fieldName])
                        .to.equal(record[fieldName]);
                });
            });
        });

    });

    describe('when data has loaded, and I go to the 2nd page, then back to the first', () => {
        const fieldList = ['id', 'title', 'published', 'post_date'];
        const rowLimit = 3;
        let modelData: IModelTestData;
        let expectedData: models.Post[];

        before(async () => {
            modelManager = models.getModelManager();
            modelData = await createData(modelManager);
            expectedData = modelData.posts.slice(0, 3);

            lifecycleOptions.enableComponentDidMount = true;
            receivedProps = null;
            const wrapper = mountComponent(
                <ListView
                    title="List with Data Loaded..."
                    model={model}
                    fields={fieldList}
                    limit={rowLimit}
                    component={SpyComponent}
                />);
            await sleep(10);
            wrapper.update();
            receivedProps.onForwardButtonPress();
            await sleep(10);
            wrapper.update();
            receivedProps.onBackButtonPress();
            await sleep(10);
            wrapper.update();
        });

        it('record numbers are set based on offset + limut', () => {
            expect(receivedProps.firstRecordNumber).to.equal(1);
            expect(receivedProps.lastRecordNumber).to.equal(3);
            expect(receivedProps.totalCount).to.equal(modelData.posts.length);
        });

        it('the go-back button is disabled', () => {
            expect(receivedProps.backButtonDisabled).to.be.true;
        });

        it('the go-forward button is not disabled', () => {
            expect(receivedProps.forwardButtonDisabled).to.be.false;
        });

        it('passes the correct record data', () => {
            expectedData.forEach((record, recordIdx) => {
                fieldList.forEach((fieldName) => {
                    expect(receivedProps.records[recordIdx][fieldName])
                        .to.equal(record[fieldName]);
                });
            });
        });

    });

    describe('when data has loaded but there are no results', () => {
        const fieldList = ['id', 'title', 'published'];
        let expectedFields: fields.Field[];

        before(async () => {
            modelManager = models.getModelManager();
            const meta = modelManager.getModelMeta(models.Post);
            expectedFields = fieldList.map((fieldName) => meta.fieldsByName[fieldName]);

            lifecycleOptions.enableComponentDidMount = true;
            receivedProps = null;
            const wrapper = mountComponent(
                <ListView
                    title="List with Data Loaded..."
                    model={model}
                    fields={fieldList}
                    component={SpyComponent}
                />);
            await sleep(10);
            wrapper.update();
        });

        it('record numbers are set to zero', () => {
            expect(receivedProps.firstRecordNumber).to.equal(0);
            expect(receivedProps.lastRecordNumber).to.equal(0);
            expect(receivedProps.totalCount).to.equal(0);
        });

        it('the go-back button is disabled', () => {
            expect(receivedProps.backButtonDisabled).to.be.true;
        });

        it('the go-forward button is disabled', () => {
            expect(receivedProps.forwardButtonDisabled).to.be.true;
        });

        it('passes the fields list', () => {
            expect(receivedProps.fields).to.deep.equal(expectedFields);
        });

        it('passes empty record data', () => {
            expect(receivedProps.records).to.deep.equal([]);
        });

    });

});