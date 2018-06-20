
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';

import { MUIBooleanSearchField } from '../MUIBooleanSearchField';
import Grid from '@material-ui/core/Grid';
import { ISearchFieldComponentProps } from 'rev-ui/lib/fields/SearchField';
import { fields } from 'rev-models';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';

describe('MUIBooleanSearchField', () => {

    let props: ISearchFieldComponentProps;
    let wrapper: ReactWrapper;
    let onChangeFn: sinon.SinonSpy;

    function getComponentProps(): ISearchFieldComponentProps {
        onChangeFn = sinon.spy();
        return {
            field: new fields.BooleanField('boolean_field'),
            label: 'Boolean Field',
            colspanNarrow: 12,
            colspan: 6,
            colspanWide: 4,
            criteria: { _eq: true },
            style: {marginTop: 10},
            onCriteriaChange: onChangeFn
        };
    }

    function render() {
        wrapper = mount(
            <MUIBooleanSearchField {...props} />
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

        it('renders a shunken InputLabel component', () => {
            const label = wrapper.find(InputLabel);
            expect(label).to.have.length(1);
            expect(label.prop('shrink')).to.be.true;
            expect(label.text()).to.equal('Boolean Field');
        });

        it('renders a Select component', () => {
            const select = wrapper.find(Select);
            expect(select).to.have.length(1);
        });

        it('Select component has expected props', () => {
            const select = wrapper.find(Select);
            expect(select).to.have.length(1);
            expect(select.prop('inputProps')).to.deep.equal({ id: props.field.name });
            expect(select.prop('value')).to.equal('Y');
        });

        it('Select component has correct options', () => {
            const select = wrapper.find(Select).at(0);
            const selectionOpts = select.prop('children');
            expect(selectionOpts[0].props.value).to.equal('');
            expect(selectionOpts[0].props.children).to.be.undefined;
            expect(selectionOpts[1].props.value).to.equal('Y');
            expect(selectionOpts[1].props.children).to.equal('Yes');
            expect(selectionOpts[2].props.value).to.equal('N');
            expect(selectionOpts[2].props.children).to.equal('No');
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

        it('select value is empty', () => {
            const input = wrapper.find(Select);
            expect(input).to.have.length(1);
            expect(input.prop('value')).to.equal('');
        });

    });

    describe('onChange()', () => {

        beforeEach(() => {
            props = getComponentProps();
            render();
        });

        it.skip('changing the selected option updates the _eq criteria', () => {
            // TODO: Figure out how to test onChange for MUI Select
        });

    });

});