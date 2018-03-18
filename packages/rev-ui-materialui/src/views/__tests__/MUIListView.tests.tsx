
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';

import { ModelManager, IModelMeta } from 'rev-models';
import * as models from '../../__fixtures__/models';
import { getData, IModelTestData } from '../../__fixtures__/modeldata';

import Table from 'material-ui/Table';
import { getClasses } from 'material-ui/test-utils';
import { CircularProgress } from 'material-ui/Progress';

import { MUIListView } from '../MUIListView';
import { IListViewComponentProps } from 'rev-ui/lib/views/ListView';

describe('MUIListView', () => {

    let modelManager: ModelManager;
    let modelData: IModelTestData;
    let modelMeta: IModelMeta<models.Post>;
    let props: IListViewComponentProps;
    let wrapper: ReactWrapper;
    let classes: any;

    before(async () => {
        modelManager = models.getModelManager();
        modelMeta = modelManager.getModelMeta(models.Post);
        modelData = await getData(modelManager);
        classes = getClasses(
            React.createElement(MUIListView)
        );
    });

    function getComponentProps(options: {loaded: boolean, count: number}) {
        const cProps: IListViewComponentProps = {
            loadState: 'LOADING',
            title: 'Test List',
            fields: modelMeta.fields,
            records: [],
            firstRecordNumber: 0,
            lastRecordNumber: 0 ,
            totalCount: 0,
            backButtonDisabled: true,
            forwardButtonDisabled: true,
            onBackButtonPress: sinon.spy(),
            onForwardButtonPress: sinon.spy(),
            onRecordPress: sinon.spy()
        };
        if (options.loaded) {
            cProps.loadState = 'NONE';
            cProps.records = modelData.posts.slice(0, options.count);
            cProps.firstRecordNumber = options.count > 0 ? 1 : 0;
            cProps.lastRecordNumber = options.count;
            cProps.totalCount = modelData.posts.length;
            cProps.backButtonDisabled = true;
            cProps.forwardButtonDisabled = false;
        }
        return cProps;
    }

    describe('when no data is loaded', () => {
        let pagination: ReactWrapper;
        let paginationButtons: ReactWrapper;

        before(() => {
            props = getComponentProps({ loaded: false, count: 0 });
            wrapper = mount(
                <MUIListView {...props} />
            );
            pagination = wrapper.find('div.' + classes.pagination).at(0);
            paginationButtons = pagination.find('button');
        });

        describe('main elements', () => {

            it('renders the list title', () => {
                const listTitle = wrapper.find('h2');
                expect(listTitle).to.have.length(1);
                expect(listTitle.at(0).text()).to.equal(props.title);
            });

            it('renders "Loading" in the pagination area', () => {
                const paginationText = pagination.childAt(0).text();
                expect(paginationText).to.equal('Loading');
            });

            it('renders a circular spinner in the pagination area', () => {
                const spinner = pagination.find(CircularProgress);
                expect(spinner).to.have.length(1);
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
                expect(wrapper.find('th')).to.have.length(props.fields.length);
            });

            it('renders columns heading labels in correct order', () => {
                props.fields.forEach((field, idx) => {
                    const th = wrapper.find('th').at(idx);
                    expect(th.text()).to.equal(
                        field.options.label
                        || field.name
                    );
                });
            });

            it('does not render a table body', () => {
                expect(wrapper.find('tbody')).to.have.length(0);
            });

        });

    });

    describe('when data has loaded - with results', () => {

        before(() => {
            props = getComponentProps({ loaded: true, count: 5 });
            wrapper = mount(
                <MUIListView {...props} />
            );
        });

        describe('main elements', () => {

            it('renders the list title', () => {
                const listTitle = wrapper.find('h2');
                expect(listTitle).to.have.length(1);
                expect(listTitle.at(0).text()).to.equal(props.title);
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
                expect(paginationText).to.equal(
                    `Records ${props.firstRecordNumber}-${props.lastRecordNumber} of ${props.totalCount}`);
            });

            it('remders the go-forward and go-back buttons', () => {
                expect(paginationButtons).to.have.length(2);
            });

            it('the go-back button is disabled', () => {
                expect(paginationButtons.at(0).prop('disabled')).to.equal(props.backButtonDisabled);
            });

            it('the go-forward button is not disabled', () => {
                expect(paginationButtons.at(1).prop('disabled')).to.equal(props.forwardButtonDisabled);
            });

        });

        describe('table data', () => {

            it('renders all column headings', () => {
                expect(wrapper.find('th')).to.have.length(props.fields.length);
            });

            it('renders columns heading labels in correct order', () => {
                props.fields.forEach((field, idx) => {
                    const th = wrapper.find('th').at(idx);
                    expect(th.text()).to.equal(
                        field.options.label
                        || field.name
                    );
                });
            });

            it('renders table body', () => {
                expect(wrapper.find('tbody')).to.have.length(1);
            });

            it('renders all records in props.records', () => {
                expect(
                    wrapper.find('tbody')
                    .at(0).find('tr')
                ).to.have.length(props.records.length);
            });

            it('renders the correct data in each cell', () => {
                for (let i = 0; i < props.records.length; i++) {
                    const post = modelData.posts[i];
                    const row = wrapper.find('tbody')
                        .at(0).find('tr').at(i);

                    props.fields.forEach((field, fieldIdx) => {
                        const td = row.find('td').at(fieldIdx);

                        expect(td.text()).to.equal(
                            post[field.name] ? post[field.name].toString() : ''
                        );
                    });
                }
            });

        });

    });

    describe('when data has loaded - no results', () => {

        before(() => {
            props = getComponentProps({ loaded: true, count: 0 });
            wrapper = mount(
                <MUIListView {...props} />
            );
        });

        describe('main elements', () => {

            it('renders the list title', () => {
                const listTitle = wrapper.find('h2');
                expect(listTitle).to.have.length(1);
                expect(listTitle.at(0).text()).to.equal(props.title);
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
                expect(paginationText).to.equal(
                    `Records ${props.firstRecordNumber}-${props.lastRecordNumber} of ${props.totalCount}`);
            });

            it('remders the go-forward and go-back buttons', () => {
                expect(paginationButtons).to.have.length(2);
            });

            it('the go-back button is disabled', () => {
                expect(paginationButtons.at(0).prop('disabled')).to.equal(props.backButtonDisabled);
            });

            it('the go-forward button is not disabled', () => {
                expect(paginationButtons.at(1).prop('disabled')).to.equal(props.forwardButtonDisabled);
            });

        });

        describe('table data', () => {

            it('renders all column headings', () => {
                expect(wrapper.find('th')).to.have.length(props.fields.length);
            });

            it('renders all columns headings', () => {
                props.fields.forEach((field, idx) => {
                    const th = wrapper.find('th').at(idx);
                    expect(th.text()).to.equal(
                        field.options.label
                        || field.name
                    );
                });
            });

            it('does not render table body', () => {
                expect(wrapper.find('tbody')).to.have.length(0);
            });

            it('does not render any rows', () => {
                expect(
                    wrapper.find('tbody')
                    .at(0).find('tr')
                ).to.have.length(0);
            });

        });

    });

    describe('Event Handlers', () => {
        let pagination: ReactWrapper;

        function getSpy(spy: any): sinon.SinonSpy {
            return spy;
        }

        before(() => {
            props = getComponentProps({ loaded: true, count: 5 });
            props.backButtonDisabled = false;
            props.forwardButtonDisabled = false;
            wrapper = mount(
                <MUIListView {...props} />
            );
            pagination = wrapper.find('div.' + classes.pagination).at(0);
        });

        it('when I click the back button, the onBackButtonPressed handler is called', () => {
            const pressSpy = getSpy(props.onBackButtonPress);
            expect(pressSpy.callCount).to.equal(0);

            const button = pagination.find('button').at(0);
            button.simulate('click');

            expect(pressSpy.callCount).to.equal(1);
            expect(pressSpy.getCall(0).args).to.deep.equal([]);
        });

        it('when I click the forward button, the onForwardButtonPressed handler is called', () => {
            const pressSpy = getSpy(props.onForwardButtonPress);
            expect(pressSpy.callCount).to.equal(0);

            const button = pagination.find('button').at(1);
            button.simulate('click');

            expect(pressSpy.callCount).to.equal(1);
            expect(pressSpy.getCall(0).args).to.deep.equal([]);
        });

        it('when I click a table row, the onRecordPress handler is called', () => {
            const pressSpy = getSpy(props.onRecordPress);
            expect(pressSpy.callCount).to.equal(0);

            const tableBody = wrapper.find('tbody').at(0);
            const secondRow = tableBody.find('tr').at(1);
            secondRow.simulate('click');

            expect(pressSpy.callCount).to.equal(1);
            expect(pressSpy.getCall(0).args).to.have.length(1);

            const passedRecord = pressSpy.getCall(0).args[0];
            expect(passedRecord.id).to.equal(modelData.posts[1].id);
            expect(passedRecord.title).to.equal(modelData.posts[1].title);
        });

    });

});