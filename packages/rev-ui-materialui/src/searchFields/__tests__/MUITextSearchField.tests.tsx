
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';

import { MUITextSearchField } from '../MUITextSearchField';
import Grid from 'material-ui/Grid';
import { ISearchFieldComponentProps } from 'rev-ui/lib/fields/SearchField';
import { fields } from 'rev-models';
import InputLabel from 'material-ui/Input/InputLabel';
import Input from 'material-ui/Input';

describe('MUITextSearchField', () => {

    let props: ISearchFieldComponentProps;
    let wrapper: ReactWrapper;

    function getComponentProps(): ISearchFieldComponentProps {
        return {
            field: new fields.TextField('text_field'),
            label: 'Text Field',
            colspanNarrow: 12,
            colspan: 6,
            colspanWide: 4,
            criteria: { _like: '%some value%' },
            style: {marginTop: 10},
            onCriteriaChange: sinon.stub()
        };
    }

    function render() {
        wrapper = mount(
            <MUITextSearchField {...props} />
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
            expect(label.text()).to.equal('Text Field');
            expect(label.prop('shrink')).to.be.true;
        });

        it('renders an Input component', () => {
            const input = wrapper.find(Input);
            expect(input).to.have.length(1);
        });

        it('Input component has expected props', () => {
            const input = wrapper.find(Input);
            expect(input).to.have.length(1);
            expect(input.prop('id')).to.equal(props.field.name);
            expect(input.prop('type')).to.equal('text');
            expect(input.prop('value')).to.equal('some value');
        });

        it('applies passed-in style', () => {
            const outerDiv = wrapper.find('div').at(0);
            expect(outerDiv.prop('style')).to.deep.equal({marginTop: 10});
        });

    });

});