
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';

import { MUIBooleanField } from '../MUIBooleanField';
import Grid from 'material-ui/Grid';
import { IFieldComponentProps } from 'rev-ui/lib/fields/Field';
import { fields } from 'rev-models';
import Checkbox from 'material-ui/Checkbox';
import { FormHelperText } from 'material-ui/Form';
import FormControlLabel from 'material-ui/Form/FormControlLabel';

describe('MUIBooleanField', () => {

    let props: IFieldComponentProps;
    let wrapper: ReactWrapper;

    function getComponentProps(): IFieldComponentProps {
        return {
            field: new fields.BooleanField('boolean_field'),
            label: 'Boolean Field',
            colspanNarrow: 12,
            colspan: 6,
            colspanWide: 4,
            value: true,
            errors: [],
            disabled: false,
            style: {marginTop: 10},
            onChange: sinon.stub()
        };
    }

    function render() {
        wrapper = mount(
            <MUIBooleanField {...props} />
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

        it('renders an FormControlLabel component containing label and disabled props', () => {
            const label = wrapper.find(FormControlLabel);
            expect(label).to.have.length(1);
            expect(label.prop('label')).to.equal('Boolean Field');
            expect(label.prop('disabled')).to.equal(props.disabled);
        });

        it('renders a Checkbox component', () => {
            const cb = wrapper.find(Checkbox);
            expect(cb).to.have.length(1);
        });

        it('Checkbox component has expected props', () => {
            const cb = wrapper.find(Checkbox);
            expect(cb).to.have.length(1);
            expect(cb.prop('id')).to.equal(props.field.name);
            expect(cb.prop('checked')).to.equal(props.value);
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