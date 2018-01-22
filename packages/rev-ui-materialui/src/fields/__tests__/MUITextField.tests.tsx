
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';

import { MUITextField } from '../MUITextField';
import Grid from 'material-ui/Grid';
import { IFieldComponentProps } from 'rev-ui/lib/fields/Field';
import { fields } from 'rev-models';
import InputLabel from 'material-ui/Input/InputLabel';
import Input from 'material-ui/Input';
import { FormHelperText } from 'material-ui/Form';

describe('MUITextField', () => {

    let props: IFieldComponentProps;
    let wrapper: ReactWrapper;

    function getComponentProps(): IFieldComponentProps {
        return {
            field: new fields.TextField('text_field'),
            label: 'Text Field',
            colspanNarrow: 12,
            colspan: 6,
            colspanWide: 4,
            value: 'some value',
            errors: [],
            disabled: false,
            onChange: sinon.stub()
        };
    }

    function render() {
        wrapper = mount(
            <MUITextField {...props} />
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

        it('renders an InputLabel component containing props.label', () => {
            const label = wrapper.find(InputLabel);
            expect(label).to.have.length(1);
            expect(label.text()).to.equal('Text Field');
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
            expect(input.prop('value')).to.equal(props.value);
            expect(input.prop('disabled')).to.equal(props.disabled);
        });

        it('does not render form helper text when there are no errors', () => {
            const helpText = wrapper.find(FormHelperText);
            expect(helpText).to.have.length(0);
        });

    });

    describe('field type', () => {

        before(() => {
            props = getComponentProps();
            props.field = new fields.PasswordField('password_field');
            render();
        });

        it('renders a password field when required', () => {
            const input = wrapper.find(Input);
            expect(input).to.have.length(1);
            expect(input.prop('type')).to.equal('password');
        });

    });

    describe('errors', () => {

        before(() => {
            props = getComponentProps();
            props.errors = [
                { message: 'Error 1' },
                { message: 'Error 2' }
            ];
            render();
        });

        it('renders form helper text when there are errors', () => {
            const helpText = wrapper.find(FormHelperText);
            expect(helpText).to.have.length(1);
        });

        it('error messages are concetenated', () => {
            const helpText = wrapper.find(FormHelperText);
            expect(helpText.text()).to.equal('Error 1. Error 2. ');
        });

    });

});