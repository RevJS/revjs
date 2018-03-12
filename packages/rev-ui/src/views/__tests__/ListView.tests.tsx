
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount } from 'enzyme';
import { sleep } from '../../__test_utils__/utils';
import { ListView, lifecycleOptions, IListViewComponentProps } from '../ListView';
import * as models from '../../__fixtures__/models';
import { ModelManager, IModelMeta, fields } from 'rev-models';
import { ModelProvider } from '../../provider/ModelProvider';
import { createData, IModelTestData } from '../../__fixtures__/modeldata';

describe('ListView', () => {

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

    describe('construction', () => {
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
                mount(<ListView model="Post" fields={['title']} />);
            }).to.throw('must be nested inside a ModelProvider');
        });

        it('throws error when specified model does not exist', () => {
            expect(() => {
                mountComponent(<ListView model="NonExistey" fields={['name']} />);
            }).to.throw(`Model 'NonExistey' is not registered`);
        });

        it('throws error when field name does not exist on model', () => {
            expect(() => {
                mountComponent(<ListView model="Post" fields={['flannel']} />);
            }).to.throw(`Model 'Post' does not have a field called 'flannel'`);
        });
    });

    describe('initial component props - no data loaded', () => {
        const fieldList = ['id', 'title', 'published'];
        let meta: IModelMeta<models.Post>;
        let expectedFields: fields.Field[];

        before(() => {
            modelManager = models.getModelManager();
            meta = modelManager.getModelMeta(models.Post);
            expectedFields = [
                meta.fieldsByName['id'],
                meta.fieldsByName['title'],
                meta.fieldsByName['published']
            ];
            lifecycleOptions.enableComponentDidMount = false;
            receivedProps = null;
            mountComponent(
                <ListView
                    title="Test List"
                    model={model}
                    fields={fieldList}
                    component={SpyComponent} />
            );
        });

        it('passes the list title', () => {
            expect(receivedProps.title).to.equal('Test List');
        });

        it('passes the fields list', () => {
            expect(receivedProps.fields).to.deep.equal(expectedFields);
        });

        it('passes an empty records list', () => {
            expect(receivedProps.records).to.deep.equal([]);
        });

        it('record numbers are zeros', () => {
            expect(receivedProps.firstRecordNumber).to.equal(0);
            expect(receivedProps.lastRecordNumber).to.equal(0);
            expect(receivedProps.totalCount).to.equal(0);
        });

        it('backButtonDisabled = true', () => {
            expect(receivedProps.backButtonDisabled).to.be.true;
        });

        it('backButtonDisabled = true', () => {
            expect(receivedProps.forwardButtonDisabled).to.be.true;
        });

        it('passes event handlers', () => {
            expect(receivedProps.onBackButtonPress).to.be.a('function');
            expect(receivedProps.onForwardButtonPress).to.be.a('function');
            expect(receivedProps.onRecordPress).to.be.a('function');
        });

    });

    describe('title prop - when not set', () => {
        const fieldList = ['id', 'title', 'published'];

        before(() => {
            modelManager = models.getModelManager();
            lifecycleOptions.enableComponentDidMount = false;
            receivedProps = null;
            mountComponent(
                <ListView
                    model={model}
                    fields={fieldList}
                    component={SpyComponent} />);
        });

        it('sets title to the model name + " List"', () => {
            expect(receivedProps.title).to.equal('Post List');
        });

    });

    describe('component props - when data has loaded - first page', () => {
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
            expectedFields = [
                meta.fieldsByName['id'],
                meta.fieldsByName['title'],
                meta.fieldsByName['published'],
                meta.fieldsByName['post_date']
            ];

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
            expectedFields = [
                meta.fieldsByName['id'],
                meta.fieldsByName['title'],
                meta.fieldsByName['published']
            ];

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

    describe('component props - where clause', () => {
        const fieldList = ['id', 'title', 'published', 'post_date'];
        let meta: IModelMeta<models.Post>;
        const whereClause = { id: { _gt: 5 }};
        let expectedData: models.Post[];
        let expectedFields: fields.Field[];

        before(async () => {
            modelManager = models.getModelManager();
            meta = modelManager.getModelMeta(models.Post);
            await createData(modelManager);
            expectedData = (await modelManager.read(models.Post, {
                where: whereClause
            })).results;
            expectedFields = [
                meta.fieldsByName['id'],
                meta.fieldsByName['title'],
                meta.fieldsByName['published'],
                meta.fieldsByName['post_date']
            ];

            lifecycleOptions.enableComponentDidMount = true;
            receivedProps = null;
            const wrapper = mountComponent(
                <ListView
                    title="List with Data Loaded..."
                    model={model}
                    fields={fieldList}
                    where={whereClause}
                    limit={100}
                    component={SpyComponent} />
            );
            await sleep(10);
            wrapper.update();
        });

        it('filters the list of records using the where clause', () => {
            expect(receivedProps.totalCount).to.equal(expectedData.length);
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

    describe('Event Handlers', () => {
        const fieldList = ['id', 'title', 'published', 'post_date'];
        let expectedData: IModelTestData;

        let onRecordClickSpy = sinon.stub();

        before(async () => {
            modelManager = models.getModelManager();
            expectedData = await createData(modelManager);

            lifecycleOptions.enableComponentDidMount = true;
            receivedProps = null;
            const wrapper = mountComponent(
                <ListView model={model} fields={fieldList}
                    onRecordPress={onRecordClickSpy}
                    component={SpyComponent}
                />
            );
            await sleep(10);
            wrapper.update();
        });

        describe('onRecordClick()', () => {

            it('called with record data when a row is clicked', () => {
                receivedProps.onRecordPress(expectedData.posts[1]);

                expect(onRecordClickSpy.callCount).to.equal(1);

                const passedRecord = onRecordClickSpy.getCall(0).args[0];
                expect(passedRecord.id).to.equal(expectedData.posts[1].id);
                expect(passedRecord.title).to.equal(expectedData.posts[1].title);
            });

        });

    });

});