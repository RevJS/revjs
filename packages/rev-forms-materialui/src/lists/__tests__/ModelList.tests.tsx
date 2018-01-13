
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';
import { sleep } from '../../__test_utils__/utils';
import { ModelList, lifecycleOptions } from '../ModelList';
import * as models from '../../__fixtures__/models';
import { ModelManager, IModelMeta } from 'rev-models';
import { ModelProvider } from '../../provider/ModelProvider';
import Table from 'material-ui/Table';
import { getClasses } from 'material-ui/test-utils';
import { createData, IModelTestData } from '../../__fixtures__/modeldata';

describe('ModelList', () => {

    let modelManager: ModelManager;
    let classes: any;

    before(() => {
        modelManager = models.getModelManager();
        classes = getClasses(
            <ModelList model="Post" fields={['id']} />
        );
    });

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
                mount(<ModelList model="Post" fields={['title']} />);
            }).to.throw('must be nested inside a ModelProvider');
        });

        it('throws error when specified model does not exist', () => {
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                        <ModelList model="NonExistey" fields={['name']} />
                    </ModelProvider>);
            }).to.throw(`Model 'NonExistey' is not registered`);
        });

        it('throws error when field name does not exist on model', () => {
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                        <ModelList model="Post" fields={['flannel']} />
                    </ModelProvider>);
            }).to.throw(`Model 'Post' does not have a field called 'flannel'`);
        });
    });

    describe('initial state - no data loaded', () => {
        const model = 'Post';
        const fields = ['id', 'title', 'published', 'post_date'];
        let meta: IModelMeta<models.Post>;
        let wrapper: ReactWrapper;
        let pagination: ReactWrapper;
        let paginationButtons: ReactWrapper;

        before(() => {
            modelManager = models.getModelManager();
            meta = modelManager.getModelMeta(models.Post);
            lifecycleOptions.enableComponentDidMount = false;
            wrapper = mount(
                <ModelProvider modelManager={modelManager}>
                    <ModelList
                        title="Test List"
                        model={model}
                        fields={fields} />
                </ModelProvider>);
            pagination = wrapper.find('div.' + classes.pagination).at(0);
            paginationButtons = pagination.find('button');
        });

        describe('main elements', () => {

            it('renders the list title', () => {
                const listTitle = wrapper.find('h2');
                expect(listTitle).to.have.length(1);
                expect(listTitle.at(0).text()).to.equal('Test List');
            });

            it('renders "Loading..." in the pagination area', () => {
                const paginationText = pagination.childAt(0).text();
                expect(paginationText).to.equal('Loading...');
            });

            it('remders the go-forward and go-back buttons', () => {
                expect(paginationButtons).to.have.length(2);
            });

            it('the go-forward and go-back buttons are disabled', () => {
                expect(paginationButtons.at(0).prop('disabled')).to.be.true;
                expect(paginationButtons.at(1).prop('disabled')).to.be.true;
            });

            it('renders the table', () => {
                expect(wrapper.find(Table)).to.have.length(1);
            });

            it('renders all column headings', () => {
                expect(wrapper.find('th')).to.have.length(fields.length);
            });

            it('renders columns heading labels in correct order', () => {
                fields.forEach((fieldName, idx) => {
                    const th = wrapper.find('th').at(idx);
                    expect(th.text()).to.equal(
                        meta.fieldsByName[fieldName].options.label
                        || meta.fieldsByName[fieldName].name
                    );
                });
            });

            it('renders an empty table body', () => {
                expect(wrapper.find('tbody')).to.have.length(1);
                expect(wrapper.find('tbody').at(0).children()).to.have.length(0);
            });

        });

    });

    describe('ModelList title prop - when not set', () => {
        const model = 'Post';
        const fields = ['id', 'title', 'published', 'post_date'];
        let wrapper: ReactWrapper;

        before(() => {
            modelManager = models.getModelManager();
            lifecycleOptions.enableComponentDidMount = false;
            wrapper = mount(
                <ModelProvider modelManager={modelManager}>
                    <ModelList
                        model={model}
                        fields={fields} />
                </ModelProvider>);
        });

        it('renders the model label + " List"', () => {
            const listTitle = wrapper.find('h2');
            expect(listTitle).to.have.length(1);
            expect(listTitle.at(0).text()).to.equal('Post List');
        });

    });

    describe('when data has loaded - first page', () => {
        const model = 'Post';
        const fields = ['id', 'title', 'published', 'post_date'];
        const rowLimit = 3;
        let wrapper: ReactWrapper;
        let meta: IModelMeta<models.Post>;
        let expectedData: IModelTestData;

        before(async () => {
            modelManager = models.getModelManager();
            meta = modelManager.getModelMeta(models.Post);
            expectedData = await createData(modelManager);

            lifecycleOptions.enableComponentDidMount = true;
            wrapper = mount(
                <ModelProvider modelManager={modelManager}>
                    <ModelList
                        title="List with Data Loaded..."
                        model={model}
                        fields={fields}
                        rowLimit={rowLimit}
                    />
                </ModelProvider>);
            await sleep(10);
            wrapper.update();
        });

        describe('main elements', () => {

            it('renders the list title', () => {
                const listTitle = wrapper.find('h2');
                expect(listTitle).to.have.length(1);
                expect(listTitle.at(0).text()).to.equal('List with Data Loaded...');
            });

            it('remders the pagination area', () => {
                expect(wrapper.find('div.' + classes.pagination)).to.have.length(1);
            });

            it('renders the table', () => {
                expect(wrapper.find(Table)).to.have.length(1);
            });

        });

        describe('pagination', () => {
            let pagination: ReactWrapper;
            let paginationButtons: ReactWrapper;

            before(() => {
                pagination = wrapper.find('div.' + classes.pagination).at(0);
                paginationButtons = pagination.find('button');
            });

            it('remders the current offset and total record count', () => {
                const paginationText = pagination.childAt(0).text();
                expect(paginationText).to.equal('Records 1-3 of 7');
            });

            it('remders the go-forward and go-back buttons', () => {
                expect(paginationButtons).to.have.length(2);
            });

            it('the go-back button is disabled', () => {
                expect(paginationButtons.at(0).prop('disabled')).to.be.true;
            });

            it('the go-forward button is not disabled', () => {
                expect(paginationButtons.at(1).prop('disabled')).to.be.false;
            });

        });

        describe('table data', () => {

            it('renders all column headings', () => {
                expect(wrapper.find('th')).to.have.length(fields.length);
            });

            it('renders columns heading labels in correct order', () => {
                fields.forEach((fieldName, idx) => {
                    const th = wrapper.find('th').at(idx);
                    expect(th.text()).to.equal(
                        meta.fieldsByName[fieldName].options.label
                        || meta.fieldsByName[fieldName].name
                    );
                });
            });

            it('renders table body', () => {
                expect(wrapper.find('tbody')).to.have.length(1);
            });

            it('renders up to "rowLimit" rows of data', () => {
                expect(
                    wrapper.find('tbody')
                    .at(0).find('tr')
                ).to.have.length(rowLimit);
            });

            it('renders the correct data in each cell', () => {
                for (let i = 0; i < rowLimit; i++) {
                    const post = expectedData.posts[i];
                    const row = wrapper.find('tbody')
                        .at(0).find('tr').at(i);

                    fields.forEach((fieldName, fieldIdx) => {
                        const td = row.find('td').at(fieldIdx);

                        expect(td.text()).to.equal(
                            post[fieldName].toString()
                        );
                    });
                }
            });

        });

    });

    describe('when data has loaded, and I go to the 2nd page', () => {
        const model = 'Post';
        const fields = ['id', 'title', 'published', 'post_date'];
        const rowLimit = 3;
        let wrapper: ReactWrapper;
        let expectedData: IModelTestData;
        let pagination: ReactWrapper;
        let backButton: ReactWrapper;
        let forwardButton: ReactWrapper;

        before(async () => {
            modelManager = models.getModelManager();
            expectedData = await createData(modelManager);

            lifecycleOptions.enableComponentDidMount = true;
            wrapper = mount(
                <ModelProvider modelManager={modelManager}>
                    <ModelList
                        title="List with Data Loaded..."
                        model={model}
                        fields={fields}
                        rowLimit={rowLimit}
                    />
                </ModelProvider>);
            await sleep(10);
            wrapper.update();
            pagination = wrapper.find('div.' + classes.pagination).at(0);
            forwardButton = pagination.find('button').at(1);
            forwardButton.simulate('click');
            await sleep(10);
            wrapper.update();
            pagination = wrapper.find('div.' + classes.pagination).at(0);
            backButton = pagination.find('button').at(0);
            forwardButton = pagination.find('button').at(1);
        });

        it('remders the current offset and total record count', () => {
            const paginationText = pagination.childAt(0).text();
            expect(paginationText).to.equal('Records 4-6 of 7');
        });

        it('the go-back button is not disabled', () => {
            expect(backButton.prop('disabled')).to.be.false;
        });

        it('the go-forward button is not disabled', () => {
            expect(forwardButton.prop('disabled')).to.be.false;
        });

        it('renders "rowLimit" rows of data', () => {
            expect(
                wrapper.find('tbody')
                .at(0).find('tr')
            ).to.have.length(rowLimit);
        });

        it('renders the correct data, starting from the specified offset', () => {
            for (let i = 0; i < rowLimit; i++) {
                const postIdx = i + rowLimit;
                const post = expectedData.posts[postIdx];
                const row = wrapper.find('tbody')
                    .at(0).find('tr').at(i);

                fields.forEach((fieldName, fieldIdx) => {
                    const td = row.find('td').at(fieldIdx);

                    expect(td.text()).to.equal(
                        post[fieldName].toString()
                    );
                });
            }
        });

    });

    describe('when data has loaded, and I go to the 3rd page', () => {
        const model = 'Post';
        const fields = ['id', 'title', 'published', 'post_date'];
        const rowLimit = 3;
        let wrapper: ReactWrapper;
        let expectedData: IModelTestData;
        let pagination: ReactWrapper;
        let backButton: ReactWrapper;
        let forwardButton: ReactWrapper;

        before(async () => {
            modelManager = models.getModelManager();
            expectedData = await createData(modelManager);

            lifecycleOptions.enableComponentDidMount = true;
            wrapper = mount(
                <ModelProvider modelManager={modelManager}>
                    <ModelList
                        title="List with Data Loaded..."
                        model={model}
                        fields={fields}
                        rowLimit={rowLimit}
                    />
                </ModelProvider>);
            await sleep(10);
            wrapper.update();
            pagination = wrapper.find('div.' + classes.pagination).at(0);
            forwardButton = pagination.find('button').at(1);
            forwardButton.simulate('click');
            await sleep(10);
            wrapper.update();
            pagination = wrapper.find('div.' + classes.pagination).at(0);
            forwardButton = pagination.find('button').at(1);
            forwardButton.simulate('click');
            await sleep(10);
            wrapper.update();
            pagination = wrapper.find('div.' + classes.pagination).at(0);
            backButton = pagination.find('button').at(0);
            forwardButton = pagination.find('button').at(1);
        });

        it('remders the current offset and total record count', () => {
            const paginationText = pagination.childAt(0).text();
            expect(paginationText).to.equal('Records 7-7 of 7');
        });

        it('the go-back button is not disabled', () => {
            expect(backButton.prop('disabled')).to.be.false;
        });

        it('the go-forward button is disabled', () => {
            expect(forwardButton.prop('disabled')).to.be.true;
        });

        it('renders the last row of data', () => {
            expect(
                wrapper.find('tbody')
                .at(0).find('tr')
            ).to.have.length(1);
        });

        it('renders the correct data, starting from the specified offset', () => {
            const post = expectedData.posts[6];
            const row = wrapper.find('tbody')
                .at(0).find('tr').at(0);

            fields.forEach((fieldName, fieldIdx) => {
                const td = row.find('td').at(fieldIdx);

                expect(td.text()).to.equal(
                    post[fieldName].toString()
                );
            });
        });
    });

    describe('when data has loaded, and I go to the 2nd page, then back to the first', () => {
        const model = 'Post';
        const fields = ['id', 'title', 'published', 'post_date'];
        const rowLimit = 3;
        let wrapper: ReactWrapper;
        let expectedData: IModelTestData;
        let pagination: ReactWrapper;
        let backButton: ReactWrapper;
        let forwardButton: ReactWrapper;

        before(async () => {
            modelManager = models.getModelManager();
            expectedData = await createData(modelManager);

            lifecycleOptions.enableComponentDidMount = true;
            wrapper = mount(
                <ModelProvider modelManager={modelManager}>
                    <ModelList
                        title="List with Data Loaded..."
                        model={model}
                        fields={fields}
                        rowLimit={rowLimit}
                    />
                </ModelProvider>);
            await sleep(10);
            wrapper.update();
            pagination = wrapper.find('div.' + classes.pagination).at(0);
            forwardButton = pagination.find('button').at(1);
            forwardButton.simulate('click');
            await sleep(10);
            wrapper.update();
            pagination = wrapper.find('div.' + classes.pagination).at(0);
            backButton = pagination.find('button').at(0);
            backButton.simulate('click');
            await sleep(10);
            wrapper.update();
            pagination = wrapper.find('div.' + classes.pagination).at(0);
            backButton = pagination.find('button').at(0);
            forwardButton = pagination.find('button').at(1);
        });

        it('remders the current offset and total record count', () => {
            const paginationText = pagination.childAt(0).text();
            expect(paginationText).to.equal('Records 1-3 of 7');
        });

        it('the go-back button is disabled', () => {
            expect(backButton.prop('disabled')).to.be.true;
        });

        it('the go-forward button is not disabled', () => {
            expect(forwardButton.prop('disabled')).to.be.false;
        });

        it('renders up to "rowLimit" rows of data', () => {
            expect(
                wrapper.find('tbody')
                .at(0).find('tr')
            ).to.have.length(rowLimit);
        });

        it('renders the correct data in each cell', () => {
            for (let i = 0; i < rowLimit; i++) {
                const post = expectedData.posts[i];
                const row = wrapper.find('tbody')
                    .at(0).find('tr').at(i);

                fields.forEach((fieldName, fieldIdx) => {
                    const td = row.find('td').at(fieldIdx);

                    expect(td.text()).to.equal(
                        post[fieldName].toString()
                    );
                });
            }
        });
    });

    describe('when data has loaded but there are no results', () => {
        const model = 'Post';
        const fields = ['id', 'title', 'published', 'post_date'];
        let wrapper: ReactWrapper;
        let meta: IModelMeta<models.Post>;

        before(async () => {
            modelManager = models.getModelManager();
            meta = modelManager.getModelMeta(models.Post);

            lifecycleOptions.enableComponentDidMount = true;
            wrapper = mount(
                <ModelProvider modelManager={modelManager}>
                    <ModelList
                        title="List with Data Loaded..."
                        model={model}
                        fields={fields}
                    />
                </ModelProvider>);
            await sleep(10);
            wrapper.update();
        });

        describe('main elements', () => {

            it('renders the list title', () => {
                const listTitle = wrapper.find('h2');
                expect(listTitle).to.have.length(1);
                expect(listTitle.at(0).text()).to.equal('List with Data Loaded...');
            });

            it('remders the pagination area', () => {
                expect(wrapper.find('div.' + classes.pagination)).to.have.length(1);
            });

            it('renders the table', () => {
                expect(wrapper.find(Table)).to.have.length(1);
            });

        });

        describe('pagination', () => {
            let pagination: ReactWrapper;
            let paginationButtons: ReactWrapper;

            before(() => {
                pagination = wrapper.find('div.' + classes.pagination).at(0);
                paginationButtons = pagination.find('button');
            });

            it('remders the current offset and total record count', () => {
                const paginationText = pagination.childAt(0).text();
                expect(paginationText).to.equal('Records 0-0 of 0');
            });

            it('remders the go-forward and go-back buttons', () => {
                expect(paginationButtons).to.have.length(2);
            });

            it('the go-back button is disabled', () => {
                expect(paginationButtons.at(0).prop('disabled')).to.be.true;
            });

            it('the go-forward button is disabled', () => {
                expect(paginationButtons.at(1).prop('disabled')).to.be.true;
            });

        });

        describe('table data', () => {

            it('renders columns headings', () => {
                fields.forEach((fieldName, idx) => {
                    const th = wrapper.find('th').at(idx);
                    expect(th.text()).to.equal(
                        meta.fieldsByName[fieldName].options.label
                        || meta.fieldsByName[fieldName].name
                    );
                });
            });

            it('renders table body', () => {
                expect(wrapper.find('tbody')).to.have.length(1);
            });

            it('does not render any rows', () => {
                expect(
                    wrapper.find('tbody')
                    .at(0).find('tr')
                ).to.have.length(0);
            });

        });

    });

});