
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';

import { MUISelectSearchField } from '../MUISelectSearchField';
import Grid from '@material-ui/core/Grid';
import { ISearchFieldComponentProps } from 'rev-ui/lib/fields/SearchField';
import { fields } from 'rev-models';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';

describe('MUISelectSearchField', () => {

    let props: ISearchFieldComponentProps;
    let wrapper: ReactWrapper;
    const options = [
        ['option1', 'Option 1'],
        ['option2', 'Option 2'],
    ];

    function getComponentProps(): ISearchFieldComponentProps {
        return {
            field: new fields.SelectField('select_field', { selection: options }),
            label: 'Select Field',
            colspanNarrow: 12,
            colspan: 6,
            colspanWide: 4,
            criteria: { _eq: 'option1' },
            style: {marginTop: 10},
            onCriteriaChange: sinon.stub()
        };
    }

    function render() {
        wrapper = mount(
            <MUISelectSearchField {...props} />
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

        it('renders a shunken InputLabel component containing props.label', () => {
            const label = wrapper.find(InputLabel);
            expect(label).to.have.length(1);
            expect(label.text()).to.equal('Select Field');
            expect(label.prop('shrink')).to.be.true;
        });

        it('renders a Select component', () => {
            const select = wrapper.find(Select);
            expect(select).to.have.length(1);
        });

        it('Select component has expected props', () => {
            const select = wrapper.find(Select);
            expect(select).to.have.length(1);
            expect(select.prop('inputProps')).to.deep.equal({ id: props.field.name });
            expect(select.prop('value')).to.equal((props.criteria as any)['_eq']);
        });

        it('Select component has correct options', () => {
            const select = wrapper.find(Select).at(0);
            const blankOpt = select.prop('children')[0];
            expect(blankOpt.props.value).to.equal('');
            expect(blankOpt.props.children).to.be.undefined;
            const selectionOpts = select.prop('children')[1];
            expect(selectionOpts[0].props.value).to.equal('option1');
            expect(selectionOpts[0].props.children).to.equal('Option 1');
            expect(selectionOpts[1].props.value).to.equal('option2');
            expect(selectionOpts[1].props.children).to.equal('Option 2');
        });

        it('applies passed-in style', () => {
            const outerDiv = wrapper.find('div').at(0);
            expect(outerDiv.prop('style')).to.deep.equal({marginTop: 10});
        });

    });

});