
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';

import { MUIDateSearchField } from '../MUIDateSearchField';
import Grid from '@material-ui/core/Grid';
import { ISearchFieldComponentProps } from 'rev-ui/lib/fields/SearchField';
import { fields } from 'rev-models';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';

describe('MUIDateSearchField', () => {

    let props: ISearchFieldComponentProps;
    let wrapper: ReactWrapper;
    let onChangeFn: sinon.SinonSpy;
    const fromDate = '2018-01-01';
    const toDate = '2018-12-31';

    function getComponentProps(): ISearchFieldComponentProps {
        onChangeFn = sinon.spy();
        return {
            field: new fields.DateField('date_field'),
            label: 'Date Field',
            colspanNarrow: 12,
            colspan: 6,
            colspanWide: 4,
            criteria: { _gte: fromDate, _lte: toDate },
            style: {marginTop: 10},
            onCriteriaChange: onChangeFn
        };
    }

    function render() {
        wrapper = mount(
            <MUIDateSearchField {...props} />
        );
    }

    describe('basic rendering', () => {

        before(() => {
            props = getComponentProps();
            render();
        });

        it('renders a Grid component with "item" property set', () => {
            const grid = wrapper.find(Grid);
            expect(grid).to.have.length(1);
            expect(grid.prop('item')).to.be.true;
        });

        it('Grid component has column widths set correctly', () => {
            const grid = wrapper.find(Grid);
            expect(grid).to.have.length(1);
            expect(grid.prop('xs')).to.equal(props.colspanNarrow);
            expect(grid.prop('md')).to.equal(props.colspan);
            expect(grid.prop('lg')).to.equal(props.colspanWide);
        });

        it('renders 2 shunken InputLabel components', () => {
            const label = wrapper.find(InputLabel);
            expect(label).to.have.length(2);
            expect(label.at(0).prop('shrink')).to.be.true;
            expect(label.at(1).prop('shrink')).to.be.true;
        });

        it('first InputLabel contains field label', () => {
            const label = wrapper.find(InputLabel).at(0);
            expect(label.text()).to.equal('Date Field');
        });

        it('second InputLabel contains "to"', () => {
            const label = wrapper.find(InputLabel).at(1);
            expect(label.text()).to.equal('to');
        });

        it('renders two Date Input components', () => {
            const input = wrapper.find(Input);
            expect(input).to.have.length(2);
        });

        it('first Input component has expected props', () => {
            const input = wrapper.find(Input).at(0);
            expect(input).to.have.length(1);
            expect(input.prop('id')).to.equal(props.field.name + '_from');
            expect(input.prop('type')).to.equal('date');
            expect(input.prop('value')).to.equal(fromDate);
        });

        it('second Input component has expected props', () => {
            const input = wrapper.find(Input).at(1);
            expect(input).to.have.length(1);
            expect(input.prop('id')).to.equal(props.field.name + '_to');
            expect(input.prop('type')).to.equal('date');
            expect(input.prop('value')).to.equal(toDate);
        });

        it('applies passed-in style', () => {
            const outerDiv = wrapper.find('div').at(0);
            expect(outerDiv.prop('style')).to.deep.equal({marginTop: 10});
        });

    });

    describe('rendering - no criteria', () => {

        before(() => {
            props = getComponentProps();
            delete props.criteria;
            render();
        });

        it('first Input component is empty', () => {
            const input = wrapper.find(Input).at(0);
            expect(input).to.have.length(1);
            expect(input.prop('value')).to.equal('');
        });

        it('second Input component is empty', () => {
            const input = wrapper.find(Input).at(1);
            expect(input).to.have.length(1);
            expect(input.prop('value')).to.equal('');
        });

    });

    describe('onChange()', () => {

        beforeEach(() => {
            props = getComponentProps();
            render();
        });

        it('changing the first date updates the _gte criteria', () => {
            const input = wrapper.find('input').at(0);
            input.simulate('change', { target: {
                value: '2017-01-01'
            }});
            expect(onChangeFn.callCount).to.equal(1);
            const criteria = onChangeFn.getCall(0).args[0];
            expect(criteria._gte).to.equal('2017-01-01');
        });

        it('changing the second date updates the _lte criteria', () => {
            const input = wrapper.find('input').at(1);
            input.simulate('change', { target: {
                value: '2017-01-01'
            }});
            expect(onChangeFn.callCount).to.equal(1);
            const criteria = onChangeFn.getCall(0).args[0];
            expect(criteria._lte).to.equal('2017-01-01');
        });

        it('an empty first date removes the _gte criteria', () => {
            const input = wrapper.find('input').at(0);
            input.simulate('change', { target: {
                value: ''
            }});
            expect(onChangeFn.callCount).to.equal(1);
            const criteria = onChangeFn.getCall(0).args[0];
            expect(criteria._gte).to.be.undefined;
        });

        it('an empty second date removes the _lte criteria', () => {
            const input = wrapper.find('input').at(1);
            input.simulate('change', { target: {
                value: ''
            }});
            expect(onChangeFn.callCount).to.equal(1);
            const criteria = onChangeFn.getCall(0).args[0];
            expect(criteria._lte).to.be.undefined;
        });

    });

});