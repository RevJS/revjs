
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';

import { MUIMultiSelectField } from '../MUIMultiSelectField';
import Grid from '@material-ui/core/Grid';
import { IFieldComponentProps } from 'rev-ui/lib/fields/Field';
import { fields } from 'rev-models';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormHelperText from '@material-ui/core/FormHelperText';

describe('MUIMultiSelectField', () => {

    let props: IFieldComponentProps;
    let wrapper: ReactWrapper;
    const selection = [
        ['option1', 'Option 1'],
        ['option2', 'Option 2']
    ];

    function getComponentProps(): IFieldComponentProps {
        return {
            field: new fields.MultiSelectField('select_field', { selection }),
            label: 'Select Field',
            colspanNarrow: 12,
            colspan: 6,
            colspanWide: 4,
            value: undefined,
            errors: [],
            disabled: false,
            style: {marginTop: 10},
            onChange: sinon.stub()
        };
    }

    function render() {
        wrapper = mount(
            <MUIMultiSelectField {...props} />
        );
    }

    // TODO: Test onChange function
    // it('should set value to null when empty option is selected', () => ...)

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

        it('renders an InputLabel component containing props.label and no error', () => {
            const label = wrapper.find(InputLabel);
            expect(label).to.have.length(1);
            expect(label.text()).to.equal('Select Field');
            expect(label.prop('error')).to.be.false;
        });

        it('renders a Select component', () => {
            const select = wrapper.find(Select);
            expect(select).to.have.length(1);
        });

        it('Select component has expected props', () => {
            const select = wrapper.find(Select);
            expect(select).to.have.length(1);
            expect(select.prop('multiple')).to.be.true;
            expect(select.prop('inputProps')).to.deep.equal({ id: props.field.name });
            expect(select.prop('value')).to.deep.equal([]);
            expect(select.prop('disabled')).to.equal(props.disabled);
            expect(select.prop('error')).to.be.false;
        });

        it('Select component has correct options', () => {
            const select = wrapper.find(Select).at(0);
            const selectionOpts = select.prop('children');
            expect(selectionOpts[0].props.value).to.equal('option1');
            expect(selectionOpts[1].props.value).to.equal('option2');
        });

        it('does not render form helper text when there are no errors', () => {
            const helpText = wrapper.find(FormHelperText);
            expect(helpText).to.have.length(0);
        });

        it('applies passed-in style', () => {
            const outerDiv = wrapper.find('div').at(0);
            expect(outerDiv.prop('style')).to.deep.equal({marginTop: 10});
        });

    });

    describe('when the errors property contains items', () => {

        before(() => {
            props = getComponentProps();
            props.errors = [
                { message: 'Error 1' },
                { message: 'Error 2' }
            ];
            render();
        });

        it('InputLabel component has the error property set', () => {
            const label = wrapper.find(InputLabel);
            expect(label).to.have.length(1);
            expect(label.prop('error')).to.be.true;
        });

        it('Select component has the error property set', () => {
            const select = wrapper.find(Select);
            expect(select).to.have.length(1);
            expect(select.prop('error')).to.be.true;
        });

        it('renders form helper text with error property set', () => {
            const helpText = wrapper.find(FormHelperText);
            expect(helpText).to.have.length(1);
            expect(helpText.prop('error')).to.be.true;
        });

        it('error messages are concetenated', () => {
            const helpText = wrapper.find(FormHelperText);
            expect(helpText.text()).to.equal('Error 1. Error 2. ');
        });

    });

});